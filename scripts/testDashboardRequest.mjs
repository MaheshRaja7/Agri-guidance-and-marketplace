import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

// Load .env
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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Use known farmer user from DB
const payload = {
  userId: '698fdfbd348449f0fd62b9e1',
  email: 'rahul1@gmail.com',
  userType: 'farmer',
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

const url = 'http://localhost:3001/farmer/dashboard';

(async () => {
  const res = await fetch(url, {
    headers: {
      cookie: `token=${token}`,
      authorization: `Bearer ${token}`,
    },
    redirect: 'manual',
  });

  console.log('status', res.status, res.statusText);
  console.log('redirected', res.redirected);
  console.log('url', res.url);
  console.log('location', res.headers.get('location'));

  if (res.headers.get('content-type')?.startsWith('text/html')) {
    const body = await res.text();
    console.log('body (first 800 chars):\n', body.slice(0, 800));
  } else {
    console.log('body (json):', await res.text());
  }
})();
