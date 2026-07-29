-- Skema database P2KI UNISBA

CREATE TABLE IF NOT EXISTS ki_items (
  id SERIAL PRIMARY KEY,
  jenis TEXT NOT NULL,               -- Paten, Desain Industri, Merek, Hak Cipta, KI Komunal
  subtipe TEXT,                      -- mis. Paten Biasa / Paten Sederhana / Merek Dagang
  judul TEXT NOT NULL,
  inventor TEXT NOT NULL,
  fakultas TEXT NOT NULL,
  no_permohonan TEXT,
  no_reg TEXT,                       -- nomor paten / nomor pencatatan / nomor granted
  status_raw TEXT,                   -- status asli dari data DJKI
  status TEXT NOT NULL,              -- dinormalisasi: granted | proses | ditolak
  tahun INTEGER,
  link TEXT,
  deskripsi TEXT,
  tayang BOOLEAN DEFAULT true,        -- apakah tampil di direktori publik
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ki_jenis ON ki_items (jenis);
CREATE INDEX IF NOT EXISTS idx_ki_fakultas ON ki_items (fakultas);
CREATE INDEX IF NOT EXISTS idx_ki_status ON ki_items (status);

CREATE TABLE IF NOT EXISTS interest_requests (
  id SERIAL PRIMARY KEY,
  ki_item_id INTEGER REFERENCES ki_items(id) ON DELETE SET NULL,
  nama TEXT NOT NULL,
  institusi TEXT,
  email TEXT,
  jenis_kebutuhan TEXT,
  pesan TEXT,
  status TEXT DEFAULT 'baru',        -- baru | diproses | mou_terjalin | ditolak
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  kode TEXT UNIQUE NOT NULL,
  judul TEXT NOT NULL,
  perusahaan TEXT NOT NULL,
  kontak TEXT,
  bidang TEXT,
  deskripsi TEXT,
  kebutuhan_spesifik TEXT,           -- satu poin per baris
  skema TEXT,
  deadline DATE,
  status TEXT DEFAULT 'menunggu_tinjauan', -- menunggu_tinjauan | terbuka | segera_ditutup | ditutup
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solutions (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  nama_peneliti TEXT NOT NULL,
  fakultas TEXT,
  ringkasan TEXT,
  ki_terkait TEXT,
  status TEXT DEFAULT 'baru',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consult_messages (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  sender TEXT NOT NULL,              -- user | admin
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_qna_log (
  id SERIAL PRIMARY KEY,
  pertanyaan TEXT NOT NULL,
  jawaban TEXT NOT NULL,
  sumber TEXT DEFAULT 'rule_based', -- rule_based | anthropic_api
  created_at TIMESTAMP DEFAULT NOW()
);
