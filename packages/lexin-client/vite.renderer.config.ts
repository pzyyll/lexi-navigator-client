import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig((env) => {
  // console.trace('vite.renderer.config.tx : env', env);
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root: 'src/renderer',
    mode,
    base: './',
    build: {
      outDir: path.join(__dirname, `.vite/renderer/${name}`),
    },
    plugins: [pluginExposeRenderer(name), react()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@src': path.join(__dirname, 'src'),
        '@themes': path.join(__dirname, 'src/renderer/themes'),
        '@icons': path.join(__dirname, 'src/renderer/assets/icons'),
      },
    },
    clearScreen: false,
  } as UserConfig;
});
