import path from 'path';
import fs from 'fs';

const source = path.join(__dirname, '../templates/index.html');
const sourceContent = fs.readFileSync(source, 'utf-8');
export const template = config => sourceContent.replace(/%gradio_ts_demo_config%/, `window.gradio_ts_demo_config = ${JSON.stringify(config)}`);