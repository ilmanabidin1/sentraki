const JENIS_LIST = ['Paten', 'Hak Cipta', 'Merek', 'Desain Industri', 'KI Komunal'];
const STATUS_LABELS = { granted: 'Granted / Tercatat', proses: 'Dalam proses', ditolak: 'Ditolak / Ditarik' };
const YEAR_SQL = "COALESCE(CAST(tahun AS TEXT), 'unknown')";
const PAGE_SIZE = 12;

function values(value) {
  return [...new Set((Array.isArray(value) ? value : [value]).filter(v => typeof v === 'string' && v.length > 0))];
}

async function directoryData(pool, input) {
  const q = typeof input.q === 'string' ? input.q.trim().slice(0, 200) : '';
  const sort = ['terbaru', 'terlama', 'az', 'za'].includes(input.sort) ? input.sort : 'terbaru';
  const selected = {
    jenis: values(input.jenis).filter(v => JENIS_LIST.includes(v)),
    fakultas: values(input.fakultas),
    status: values(input.status).filter(v => Object.hasOwn(STATUS_LABELS, v)),
    tahun: values(input.tahun).filter(v => v === 'unknown' || /^\d{4}$/.test(v))
  };
  function where(filters = selected, omit) {
    const conditions = ['tayang = true'];
    const params = [];
    if (q) {
      params.push(`%${q.replace(/[\\%_]/g, '\\$&')}%`);
      conditions.push(`(judul LIKE $1 ESCAPE '\\' OR inventor LIKE $1 ESCAPE '\\' OR no_permohonan LIKE $1 ESCAPE '\\' OR no_reg LIKE $1 ESCAPE '\\')`);
    }
    for (const key of ['jenis', 'fakultas', 'status', 'tahun']) {
      if (key !== omit && filters[key].length) {
        params.push(filters[key]);
        conditions.push(`${key === 'tahun' ? YEAR_SQL : key} = ANY($${params.length})`);
      }
    }
    return { sql: conditions.join(' AND '), params };
  }
  async function counts(key) {
    const w = where(selected, key);
    const column = key === 'tahun' ? YEAR_SQL : key;
    const { rows } = await pool.query(`SELECT ${column} AS value, COUNT(*) AS n FROM ki_items WHERE ${w.sql} GROUP BY ${column}`, w.params);
    return Object.fromEntries(rows.map(r => [r.value, r.n]));
  }
  const [jenisCounts, fakultasCounts, statusCounts, tahunCounts, options] = await Promise.all([
    counts('jenis'), counts('fakultas'), counts('status'), counts('tahun'),
    pool.query(`SELECT DISTINCT fakultas, ${YEAR_SQL} AS tahun FROM ki_items WHERE tayang = true`)
  ]);
  const fakultasList = [...new Set([...options.rows.map(r => r.fakultas), ...selected.fakultas])].sort((a, b) => a.localeCompare(b, 'id'));
  const tahunList = [...new Set([...options.rows.map(r => r.tahun), ...selected.tahun])].sort((a, b) => a === 'unknown' ? 1 : b === 'unknown' ? -1 : Number(b) - Number(a));
  const w = where();
  const { rows: countRows } = await pool.query(`SELECT COUNT(*) AS n FROM ki_items WHERE ${w.sql}`, w.params);
  const total = countRows[0].n;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = typeof input.page === 'string' && /^\d+$/.test(input.page) ? Number(input.page) : 1;
  const page = Math.min(Math.max(requestedPage || 1, 1), totalPages);
  const order = { terbaru: 'tahun IS NULL, tahun DESC, id DESC', terlama: 'tahun IS NULL, tahun ASC, id ASC', az: 'judul ASC, id ASC', za: 'judul DESC, id DESC' }[sort];
  const { rows: items } = await pool.query(`SELECT * FROM ki_items WHERE ${w.sql} ORDER BY ${order} LIMIT $${w.params.length + 1} OFFSET $${w.params.length + 2}`, [...w.params, PAGE_SIZE, (page - 1) * PAGE_SIZE]);
  // Rekap paten mencakup semua status/tahun; pencarian dan fakultas tetap berlaku.
  const patentWhere = where({ ...selected, jenis: ['Paten'], status: [], tahun: [] });
  const { rows: patentYears } = await pool.query(`SELECT ${YEAR_SQL} AS tahun, COUNT(*) AS total,
    SUM(CASE WHEN status = 'granted' THEN 1 ELSE 0 END) AS granted,
    SUM(CASE WHEN status = 'proses' THEN 1 ELSE 0 END) AS proses,
    SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) AS ditolak
    FROM ki_items WHERE ${patentWhere.sql} GROUP BY tahun ORDER BY tahun IS NULL, tahun DESC`, patentWhere.params);
  const patentTotals = patentYears.reduce((acc, row) => {
    for (const key of Object.keys(acc)) acc[key] += row[key];
    return acc;
  }, { total: 0, granted: 0, proses: 0, ditolak: 0 });
  function filterUrl(patch = {}) {
    const filters = { ...selected, ...patch };
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    for (const key of ['jenis', 'fakultas', 'status', 'tahun']) filters[key].forEach(v => params.append(key, v));
    if (sort !== 'terbaru') params.set('sort', sort);
    return `/direktori?${params}`;
  }
  const activeFilters = Object.entries(selected).flatMap(([key, entries]) => entries.map(value => ({
    label: key === 'status' ? STATUS_LABELS[value] : value === 'unknown' ? 'Tahun belum tersedia' : value,
    url: filterUrl({ [key]: entries.filter(v => v !== value) })
  })));
  return { items, total, totalPages, page, sort, selected, query: { q }, jenisList: JENIS_LIST,
    fakultasList, tahunList, jenisCounts, fakultasCounts, statusCounts, tahunCounts, statusLabels: STATUS_LABELS,
    patentYears, patentTotals, filterUrl, activeFilters,
    hasActiveFilter: !!(q || activeFilters.length), baseQueryString: filterUrl().split('?')[1] };
}

module.exports = { directoryData };
