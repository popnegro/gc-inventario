const fs = require('fs');

let content = fs.readFileSync('src/data/inventory-full.ts', 'utf8');

const coords = {
  'mza-trad-01': { lat: -32.9324, lng: -68.8315 },
  'mza-trad-02': { lat: -32.9467, lng: -68.8682 },
  'mza-trad-03': { lat: -32.9582, lng: -68.8821 },
  'mza-trad-04': { lat: -32.8956, lng: -68.7734 },
  'mza-trad-05': { lat: -32.8312, lng: -68.7954 },
  'mza-trad-06': { lat: -32.8385, lng: -68.8021 },
  'mza-trad-07': { lat: -32.845, lng: -68.808 },
  'mza-trad-08': { lat: -32.9351, lng: -68.8542 },
  'mza-trad-09': { lat: -32.8988, lng: -68.8285 },
  'mza-trad-10': { lat: -32.8682, lng: -68.8354 },
  'mza-trad-11': { lat: -32.9295, lng: -68.8741 },
  'mza-trad-12': { lat: -32.9712, lng: -68.8745 },
  'mza-trad-13': { lat: -32.981, lng: -68.879 },
  'mza-trad-14': { lat: -32.9921, lng: -68.8452 },
  'mza-trad-15': { lat: -32.9935, lng: -68.838 },
  'mza-led-01': { lat: -32.8985, lng: -68.8302 },
  'mza-led-02': { lat: -32.955, lng: -68.8752 }
};

for (const [id, c] of Object.entries(coords)) {
  const regex = new RegExp("canonical_id:\\s*['\"]" + id + "['\"][\\s\\S]*?lat:\\s*null,[\\s\\S]*?lng:\\s*null,");
  content = content.replace(regex, (match) => {
    return match.replace('lat: null,', `lat: ${c.lat},`).replace('lng: null,', `lng: ${c.lng},`);
  });
}

// Add signature LED locations
if (!content.includes('GC-MZA-LED-01')) {
  const extraLeds = `  {
    canonical_id: 'GC-MZA-LED-01',
    isFeatured: true,
    name: 'Peatonal Sarmiento & Av. San Martín',
    ciudad: 'mendoza',
    tipo_soporte: 'led',
    lat: -32.8903,
    lng: -68.8415,
    address: 'Av. San Martín 1140 esq. Peatonal Sarmiento, Ciudad de Mendoza',
    description: 'Ubicación icónica en el kilómetro cero de la Ciudad de Mendoza sobre la principal arteria comercial y peatonal con altísimo tráfico peatonal y vehicular.',
    characteristics: 'Pantalla LED P8 Outdoor High-Brightness 10x4m (40 m2)',
    mapa_url: 'https://maps.app.goo.gl/PEATONAL',
    imageUrls: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'],
    disponibilidad: 'disponible',
    technical: {
      measures: '10 x 4 m (40 m2)',
      resolution: 'P8 Outdoor Ultra-Brillo',
      monthly_impacts: 1250000,
      format: 'Pantalla LED Frontal',
      spot_duration_seconds: 10,
      daily_frequency: '960 salidas diarias'
    }
  },
  {
    canonical_id: 'GC-MZA-LED-08',
    isFeatured: true,
    name: 'Acceso Este & Rondeau – Monumental',
    ciudad: 'mendoza',
    tipo_soporte: 'led',
    lat: -32.8985,
    lng: -68.8052,
    address: 'Acceso Este Km 4.5 e intersección Rondeau, Guaymallén',
    description: 'Mega pantalla publicitaria sobre la autopista de mayor caudal de ingreso al Gran Mendoza, con visibilidad frontal continua de más de 400 metros.',
    characteristics: 'Mega Pantalla LED Monumental 14x6m (84 m2)',
    mapa_url: 'https://maps.app.goo.gl/RONDEAU',
    imageUrls: ['https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80'],
    disponibilidad: 'reservado',
    technical: {
      measures: '14 x 6 m (84 m2)',
      resolution: 'P10 HDR Outdoor',
      monthly_impacts: 2400000,
      format: 'Mega Pantalla LED Autopista',
      spot_duration_seconds: 12,
      daily_frequency: '1200 salidas diarias'
    }
  },
`;
  content = content.replace('export const fixedLocations: LocationRecord[] = [', 'export const fixedLocations: LocationRecord[] = [\n' + extraLeds);
}

fs.writeFileSync('src/data/inventory.ts', content);
console.log('Successfully wrote src/data/inventory.ts');
