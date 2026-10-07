// Concept illustrations are attached to exact applications, never to unrelated records.
const illustrations = {
  P00201601452: { src:'/images/patent-wound-cream-v1.webp', alt:'Ilustrasi penelitian formulasi krim untuk luka jaringan lunak.' },
  S00202406986: { src:'/images/patent-water-apple-v1.webp', alt:'Ilustrasi daun jambu air, ekstrak, dan sediaan suspensi oral dalam penelitian farmasi.' },
  P00201508092: { src:'/images/patent-waste-energy-v1.webp', alt:'Ilustrasi konsep pemanfaatan residu daur ulang untuk energi mesin pencacah dengan sistem tertutup.' }
};

function withFeaturedIllustration(item) {
  const number = String(item.no_permohonan || '').replace(/\s/g, '').toUpperCase();
  return { ...item, illustration:Object.hasOwn(illustrations, number) ? illustrations[number] : null };
}

module.exports = { withFeaturedIllustration };
