// Test script para verificar que el servidor funciona
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/cakes',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('✅ SERVIDOR RESPONDIENDO');
    console.log('Status:', res.statusCode);
    try {
      const cakes = JSON.parse(data);
      console.log('Cakes encontradas:', cakes.length || cakes.message);
      if (Array.isArray(cakes) && cakes.length > 0) {
        console.log('✅ TOTALCOST de primer cake:', cakes[0].totalCost || 'NO CALCULADO');
      }
    } catch (e) {
      console.log('Response:', data.substring(0, 100));
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ NO HAY SERVIDOR:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ TIMEOUT - servidor no responde');
  req.destroy();
  process.exit(1);
});

req.end();
