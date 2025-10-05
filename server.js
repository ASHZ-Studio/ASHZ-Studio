const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ROOT_DIR = process.cwd();

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

function send(res, statusCode, content, contentType = 'text/plain; charset=UTF-8') {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(content);
}

const server = http.createServer((req, res) => {
    try {
        let urlPath = decodeURIComponent(req.url.split('?')[0]);
        if (urlPath === '/' || urlPath.trim() === '') {
            urlPath = '/index.html';
        }

        const safePath = path.normalize(urlPath).replace(/^\/+/, '');
        const filePath = path.join(ROOT_DIR, safePath);

        if (!filePath.startsWith(ROOT_DIR)) {
            return send(res, 403, 'Forbidden');
        }

        fs.stat(filePath, (err, stat) => {
            if (err || !stat.isFile()) {
                return send(res, 404, '404 Not Found');
            }

            const ext = path.extname(filePath).toLowerCase();
            const mime = MIME_TYPES[ext] || 'application/octet-stream';
            fs.readFile(filePath, (readErr, data) => {
                if (readErr) return send(res, 500, 'Internal Server Error');
                send(res, 200, data, mime);
            });
        });
    } catch (e) {
        send(res, 500, 'Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`Server ready: http://localhost:${PORT}`);
});


