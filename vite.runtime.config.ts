/** Acceptance entry builds the unchanged worker/host with both supported base paths. */
import {defineConfig,mergeConfig} from 'vite';
import config from './vite.config.ts';
export default mergeConfig(config,defineConfig({build:{outDir:'.cache/runtime-dist',rollupOptions:{input:{app:'index.html',runtime:'tests/fixtures/sqlite-runtime.html'}}}}));
