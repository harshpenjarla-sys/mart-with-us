const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const TOKEN = 'nfp_xACLKjiJLJQeBmm88xS7DzesMCpBaCG58796';
const SITE_ID = '1c2c88f0-7a50-4a32-9828-ecf2790e82ad'; // martwithus

async function run() {
  console.log('1. Packing frontend/dist into ZIP...');
  const zip = new AdmZip();
  const distDir = path.join(__dirname, 'frontend', 'dist');

  function addFolder(dir, base = '') {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const relPath = base ? `${base}/${file}` : file;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addFolder(fullPath, relPath);
      } else {
        const content = fs.readFileSync(fullPath);
        zip.addFile(relPath, content);
      }
    }
  }

  addFolder(distDir);
  const zipBuffer = zip.toBuffer();
  console.log(`ZIP created successfully! Size: ${zipBuffer.length} bytes`);

  console.log('2. Uploading deployment to Netlify site: martwithus...');
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/zip'
    },
    body: zipBuffer
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Deploy error:', data);
    process.exit(1);
  }

  console.log('3. Deployment result:');
  console.log('State:', data.state);
  console.log('Deploy ID:', data.id);
  console.log('Live URL:', data.ssl_url || data.url);
  console.log('Context:', data.context);
  console.log('\nSUCCESS! Website is live at:', data.ssl_url || data.url);
}

run().catch(console.error);
