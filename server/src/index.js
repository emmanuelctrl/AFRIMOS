import 'dotenv/config';
import { createApp } from './app.js';

const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy server/.env.example to server/.env and fill in the values.');
  process.exit(1);
}

const port = Number(process.env.PORT || 5000);
createApp().listen(port, () => {
  console.log(`AFRIMOS API listening on http://localhost:${port}`);
});
