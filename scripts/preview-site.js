import express from 'express';
import path from 'node:path';
import { access } from 'node:fs/promises';
import { outputRoot } from './build-site.js';

await access(path.join(outputRoot, 'index.html')).catch(() => {
  throw new Error('Run pnpm build before pnpm preview.');
});
const app = express();
app.use(express.static(outputRoot, { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(outputRoot, '404.html')));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const server = app.listen(port, host, () => console.log(`Built site preview: http://${host}:${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
