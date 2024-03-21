import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs-extra';

// https://vitejs.dev/config
export default defineConfig((env) => {
  // console.trace('vite.renderer.config.tx : env', env);
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';
  let routers: string[] | undefined;

  return {
    root: 'src/renderer',
    mode,
    base: './',
    build: {
      outDir: path.join(__dirname, `.vite/renderer/${name}`),
      rollupOptions: {
        output: {
          manualChunks(id) {
            if(id.includes("node_modules")) {
              return "vendor";
            }
            if(id.includes("themes")) {
              return "themes";
            }
            if(!routers) {
              routers = fs.readdirSync(path.resolve(__dirname, "src/renderer/routers"));
            }
            const router = routers.find((router) => id.includes(`routers/${router}`));
            if(router) {
              return router;
            }
          }
        },
      },
    },
    plugins: [pluginExposeRenderer(name), react()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@src': path.join(__dirname, 'src'),
        '@themes': path.join(__dirname, 'src/renderer/themes'),
        '@icons': path.join(__dirname, 'src/renderer/assets/icons'),
        '@resources': path.join(__dirname, 'resources'),
      },
    },
    clearScreen: false,
  } as UserConfig;
});
