async function searchSuggestions(pool, input) {
  const q = typeof input === 'string' ? input.trim().slice(0, 200) : '';
  if (q.length < 2) return { q, items: [] };
  const literal = q.replace(/[\\%_]/g, '\\$&');
  const { rows } = await pool.query(`SELECT id, jenis, judul, inventor, status, tahun
    FROM ki_items WHERE tayang = true AND
    (judul LIKE $1 ESCAPE '\\' OR inventor LIKE $1 ESCAPE '\\'
      OR no_permohonan LIKE $1 ESCAPE '\\' OR no_reg LIKE $1 ESCAPE '\\')
    ORDER BY CASE WHEN judul LIKE $2 ESCAPE '\\' THEN 0 ELSE 1 END,
      tahun IS NULL, tahun DESC, id DESC LIMIT 6`, [`%${literal}%`, `${literal}%`]);
  return { q, items: rows };
}

module.exports = { searchSuggestions };
