import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs-extra";

// https://vitejs.dev/config/
let routers;
export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if(id.includes("node_modules")) {
            return "vendor";
          }
          if(!routers) {
            routers = fs.readdirSync(path.resolve(__dirname, "src/routes"));
          }
          const router = routers.find((router) => id.includes(`routes/${router}`));
          if(router) {
            return router;
          }
        }
      },
    }
  },
  root: "src",
  base: "/",
  publicDir: path.resolve(__dirname, "./public"),
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
      },
    },
  },
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@src": path.resolve(__dirname, "./src"),
      "@themes": path.resolve(__dirname, "./src/components/themes"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@icons": path.resolve(__dirname, "./src/components/icons"),
    },
  },
});
