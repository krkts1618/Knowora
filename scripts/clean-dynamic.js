const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      walk(fp);
    } else if (f === 'route.ts') {
      const c = fs.readFileSync(fp, 'utf8');
      if (c.includes('export const dynamic')) {
        fs.writeFileSync(fp, c.replace(/export const dynamic = "force-dynamic";\r?\n?/g, ''));
        console.log('Removed dynamic from:', fp);
      }
    }
  }
}

walk(path.join(__dirname, '..', 'src', 'app', 'api'));
