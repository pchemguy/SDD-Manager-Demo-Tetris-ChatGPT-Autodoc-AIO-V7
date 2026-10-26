import {defineConfig} from 'vite';
import fs from 'node:fs';
export default defineConfig({optimizeDeps:{include:['sql.js','ajv/dist/2020']},base:process.env.APP_BASE || '/',server:{host:'127.0.0.1'},preview:{host:'127.0.0.1'},plugins:[{name:'canonical-save-schema',generateBundle(){this.emitFile({type:'asset',fileName:'tetris-save.schema.json',source:fs.readFileSync('docs/dev/spec/SAVE-SCHEMA.json')});}}]});
