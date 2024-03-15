import say from 'say';
import express from 'express';
import cors from 'cors';
import path from 'path';
import wav from 'wav';
import { PassThrough, Readable } from 'stream';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors({
    origin: '*', // Allows access to all origins! - Insecure - Replace with site url in real world applications - http://example.com
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.json());

const port = 80;
app.listen(port);
console.log('Server started at http://localhost:' + port);
