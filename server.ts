import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Endpoint to trigger build and download
  app.get('/api/download-offline', (req, res) => {
    try {
      console.log('Building offline version...');
      // Run build synchronously
      execSync('npx vite build', { stdio: 'inherit' });
      const filePath = path.resolve(__dirname, 'dist/index.html');
      
      if (fs.existsSync(filePath)) {
        res.download(filePath, 'zhishi-novel-offline.html');
      } else {
        res.status(500).send('Build failed, file not found.');
      }
    } catch (e) {
      console.error(e);
      res.status(500).send('Error building offline version.');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
