import {defineConfig} from 'vite';
export default defineConfig({base:process.env.APP_BASE || '/',server:{host:'127.0.0.1'},preview:{host:'127.0.0.1'}});
