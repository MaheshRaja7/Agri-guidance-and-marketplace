import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Load .env values
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf-8');
  envText.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([^#][^=\s]*)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const secret = process.env.JWT_SECRET || 'your-secret-key';
const token = jwt.sign({ userId: '698fdfbd348449f0fd62b9e1', email: 'rahul1@gmail.com', userType: 'farmer' }, secret, { expiresIn: '7d' });

(async () => {
  const res = await fetch('http://localhost:3001/api/auth/verify', {
    headers: {
      cookie: `token=${token}`,
    },
    redirect: 'manual',
  });

  console.log('status', res.status, res.statusText);
  console.log('redirected', res.redirected);
  console.log('location', res.headers.get('location'));
  console.log('body:', await res.text());
})();
