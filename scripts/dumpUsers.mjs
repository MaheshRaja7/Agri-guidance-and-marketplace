import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load .env variables into process.env if not already set
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

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: 'agri-marketplace' });
  const users = await mongoose.connection.collection('users').find({}).limit(5).toArray();
  console.log('Found users:', users);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
