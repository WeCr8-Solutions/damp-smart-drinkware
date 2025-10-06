import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3030;

// Serve static files from the website directory
app.use(express.static(path.resolve(__dirname, '../../')));

// Handle routes for HTML files
app.get('/*', (req, res) => {
    const filePath = path.join(__dirname, '../../pages', req.path);
    res.sendFile(filePath);
});

export function startServer() {
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.log(`Test server running at http://localhost:${port}`);
            resolve(server);
        });
    });
}