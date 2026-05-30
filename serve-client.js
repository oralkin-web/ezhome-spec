const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');
const API_HOST = 'api.useseta.com';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.webp': 'image/webp',
};

// Проксируем /api/* и /p/* на бэкенд
function proxyRequest(req, res) {
  const headers = Object.assign({}, req.headers, { host: API_HOST });
  delete headers['content-length']; // пересчитается автоматически

  const options = {
    hostname: API_HOST,
    port: 443,
    path: req.url,
    method: req.method,
    headers,
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq, { end: true });
}

// Отдаём статику с SPA-fallback
function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST, urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // Проксируем API и публичные страницы клиентов на бэкенд
  if (urlPath.startsWith('/api/') || urlPath.startsWith('/p/')) {
    proxyRequest(req, res);
  } else {
    serveStatic(req, res);
  }
}).listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
