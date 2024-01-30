import path from "path";
import fs from "fs";
import vuePlugin from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

const getPages = () => {
  const map = {};
  const pagesPath = path.join(__dirname, "./src/renderer/pages");
  const entryFiles = fs.readdirSync(pagesPath);
  entryFiles.forEach(filePath => {
    const indexPath = path.join(__dirname, `src/renderer/pages/${filePath}/index.html`);
    if(fs.existsSync(indexPath)){
      map[filePath] = indexPath;
    }
  });
  return map;
};

/**
 * https://vitejs.dev/config
 */
export default defineConfig({
  root: path.join(__dirname, "src", "renderer"),
  publicDir: "public",
  server: {
    port: 8080,
  },
  open: false,
  build: {
    outDir: path.join(__dirname, "build", "renderer"),
    emptyOutDir: true,
    rollupOptions: {
      input: getPages(),
      output: {
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        compact: true,
      }
    }
  },
  plugins: [
    vuePlugin(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
});
