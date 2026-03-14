import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Load .env (simple parser)
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
const payload = { userId: '698fdfbd348449f0fd62b9e1', email: 'rahul1@gmail.com', userType: 'farmer' };

const token = jwt.sign(payload, secret, { expiresIn: '7d' });
console.log('token:', token);

try {
  const decoded = jwt.verify(token, secret);
  console.log('decoded:', decoded);
} catch (err) {
  console.error('verification failed:', err);
}
