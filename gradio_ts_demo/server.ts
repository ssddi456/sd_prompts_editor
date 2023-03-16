import { getConfig } from './modules/ui';
import express from 'express';
import { bridgeMap } from './modules/bridge';
import path from 'path';
import { template } from './modules/template';
import fs from 'fs';
import ts from 'typescript';

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/js/*', (req, res) => {
    const filePath = req.path;
    const ext = path.extname(filePath);
    const contentType: Record<string, string> = {
        '.js': 'text/javascript', 
        '.ts': 'text/typescript',
        '.tsx': 'text/typescript',
    };
    res.setHeader('Content-Type', contentType[ext] || 'text/plain');
    const source = path.join(__dirname, `./${filePath.replace('/js/', '')}`);
    const content = fs.readFileSync(source, 'utf-8');

    if (ext === '.ts' || ext === '.tsx') {
        // traspile ts to js
        const result = ts.transpileModule(content, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2015,
                jsx: ts.JsxEmit.React,
            },
        });
        res.end(result.outputText);
    } else {
        res.end(content);
    }
});

app.get('/', (req, res) => {
    res.send(template(getConfig()));
    res.end()
});

app.post('/api/:bridgename', async (req, res) => {
    const target = req.params.bridgename;
    if (bridgeMap[target]) {
        try {
            const ret = await bridgeMap[target](...req.body);
            res.json({ error: 0, data: ret instanceof Array? ret : [ret] });
        } catch (error) {
            res.json({ error: 1, message: (error as any).message || '' });
        }
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});