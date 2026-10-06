// Curated from the public EKII catalogue, checked 2026-10-06.
// Titles, editions and PDF URLs are source metadata. Descriptions are brief
// editorial introductions, not reproduced PDF text or claims of content review.
const CATALOGUE_URL = 'https://ekii.dgip.go.id/sumber-daya/modul-ajar';
const CHECKED_AT = '2026-10-06';
const TOPICS = [
  { id: 'dasar-ki', label: 'Dasar KI', icon: 'book' },
  { id: 'paten', label: 'Paten', icon: 'patent' },
  { id: 'hak-cipta', label: 'Hak Cipta', icon: 'copyright' },
  { id: 'merek', label: 'Merek', icon: 'trademark' },
  { id: 'indikasi-geografis', label: 'Indikasi Geografis', icon: 'home' },
  { id: 'desain-industri', label: 'Desain Industri', icon: 'design' },
  { id: 'ki-komunal', label: 'KI Komunal', icon: 'communal' }
];
const MODULES = [
  { id: 'ki-lat-pemula', title: 'Modul Ki-lat untuk Pemula', topics: ['dasar-ki'], edition: null, level: 'Pemula', file: '1736225506',
    description: 'Pintu masuk untuk mengenali kekayaan intelektual sebelum memilih bacaan yang lebih spesifik.' },
  { id: 'paten-dasar-2020', title: 'Modul Kekayaan Intelektual Tingkat Dasar Bidang Paten (Edisi 2020)', topics: ['paten'], edition: 2020, level: 'Dasar', file: '1736304002',
    description: 'Bacaan dasar bagi inventor dan peneliti yang ingin mempelajari bidang paten.' },
  { id: 'hak-cipta-dasar-2020', title: 'Modul Kekayaan Intelektual Tingkat Dasar Bidang Hak Cipta (Edisi 2020)', topics: ['hak-cipta'], edition: 2020, level: 'Dasar', file: '1736303736',
    description: 'Materi dasar untuk mengenali hak cipta dalam karya ilmiah, materi ajar, dan hasil kreativitas.' },
  { id: 'pengenalan-merek', title: 'Pengenalan Merek', topics: ['merek'], edition: null, level: null, file: '1744252020',
    description: 'Pengantar bidang merek untuk memahami identitas barang dan jasa.' },
  { id: 'desain-industri-prosedur', title: 'Pelindungan dan Prosedur Pendaftaran Desain Industri', topics: ['desain-industri'], edition: null, level: null, file: '1744247929',
    description: 'Referensi untuk mempelajari pelindungan desain industri dan prosedur pendaftarannya.' },
  { id: 'ki-komunal', title: 'MODUL KI BIDANG KEKAYAAN INTELEKTUAL KOMUNAL', topics: ['ki-komunal'], edition: null, level: null, file: '1736224746',
    description: 'Materi pengenalan kekayaan intelektual yang berkaitan dengan komunitas dan warisan pengetahuan.' },
  { id: 'kik-perlindungan-defensif', title: 'Analisis Yuridis Perlindungan Defensif atas KIK', topics: ['ki-komunal'], edition: null, level: null, file: '1736224900',
    description: 'Bacaan analitis mengenai pendekatan perlindungan defensif pada kekayaan intelektual komunal.' },
  { id: 'merek-ig-2019', title: 'Modul KI bidang Merek dan Indikasi Geografis (Edisi 2019)', topics: ['merek', 'indikasi-geografis'], edition: 2019, level: null, file: '1736225016',
    description: 'Referensi yang menggabungkan pembelajaran merek dan indikasi geografis dalam satu modul.' },
  { id: 'merek-ig-lanjut-2020', title: 'Modul KI Tingkat Lanjut Merek dan Indikasi Geografis (Edisi 2020)', topics: ['merek', 'indikasi-geografis'], edition: 2020, level: 'Lanjut', file: '1736225182',
    description: 'Bacaan lanjutan setelah mempelajari pengantar merek dan indikasi geografis.' },
  { id: 'pemeliharaan-paten', title: 'Panduan Pemeliharaan Paten', topics: ['paten'], edition: null, level: null, file: '1736225426',
    description: 'Panduan bagi pemegang paten untuk mempelajari aspek pemeliharaan patennya.' },
  { id: 'paten-2019', title: 'Modul KI bidang Paten (Edisi 2019)', topics: ['paten'], edition: 2019, level: null, file: '1736225834',
    description: 'Referensi bidang paten edisi 2019 untuk memperluas bacaan tentang invensi.' },
  { id: 'desain-industri-2019', title: 'Modul KI bidang Desain Industri (Edisi 2019)', topics: ['desain-industri'], edition: 2019, level: null, file: '1736229552',
    description: 'Modul bidang desain industri untuk memahami pelindungan tampilan sebuah produk.' },
  { id: 'perlindungan-ig', title: 'Perlindungan IG', topics: ['indikasi-geografis'], edition: null, level: null, file: '1744249164',
    description: 'Referensi tentang pelindungan indikasi geografis sebagai bidang kekayaan intelektual.' }
].map(item => Object.freeze({ ...item, pdfUrl: `https://ekii.dgip.go.id/storage/modulajar/file_name_${item.file}.pdf`, publisher: 'Direktorat Jenderal Kekayaan Intelektual',
  topicLabels: item.topics.map(id => TOPICS.find(t => t.id === id).label), icon: TOPICS.find(t => t.id === item.topics[0]).icon }));

function text(value) { return typeof value === 'string' ? value.trim().slice(0, 200) : ''; }
function catalogueData(input = {}) {
  const q = text(input.q);
  const topic = TOPICS.some(t => t.id === input.topik) ? input.topik : '';
  const level = ['Pemula', 'Dasar', 'Lanjut'].includes(input.tingkat) ? input.tingkat : '';
  const search = q.toLocaleLowerCase('id-ID');
  const contextual = MODULES.filter(m => (!level || m.level === level) && (!search || `${m.title} ${m.description} ${m.topicLabels.join(' ')}`.toLocaleLowerCase('id-ID').includes(search)));
  const items = contextual.filter(m => !topic || m.topics.includes(topic));
  function filterUrl(patch = {}) {
    const selected = { q, topik: topic, tingkat: level, ...patch };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(selected)) if (value) params.set(key, value);
    return `/pelajari-ki${params.size ? '?' + params : ''}`;
  }
  return { modules: items, totalModules: MODULES.length, contextualTotal: contextual.length, query: { q, topic, level }, topics: TOPICS,
    topicCounts: Object.fromEntries(TOPICS.map(t => [t.id, contextual.filter(m => m.topics.includes(t.id)).length])),
    catalogueUrl: CATALOGUE_URL, checkedAt: CHECKED_AT, filterUrl, hasActiveFilter: !!(q || topic || level) };
}

function moduleReferences(question) {
  const q = text(question).toLocaleLowerCase('id-ID');
  const keywords = [ ['paten', 'paten'], ['hak-cipta', 'hak cipta'], ['desain-industri', 'desain industri'], ['ki-komunal', 'komunal'], ['indikasi-geografis', 'indikasi geografis'], ['merek', 'merek'], ['dasar-ki', 'pemula'] ];
  const matches = keywords.filter(([, keyword]) => q.includes(keyword)).map(([topic]) => topic);
  return MODULES.filter(m => matches.some(t => m.topics.includes(t))).slice(0, 3).map(m => ({ id: m.id, title: m.title }));
}

module.exports = { MODULES, TOPICS, CATALOGUE_URL, CHECKED_AT, catalogueData, moduleReferences };
