import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { sync as glob } from "glob";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  appType: "mpa",
  plugins: [
    nodePolyfills({
      include: ["crypto", "stream", "util", "buffer"],
    }),
    {
      name: "build-tree",
      enforce: "post",
      generateBundle(_, bundle) {
        const isSrc = /^src\/.*\.html$/;
        for (const out of Object.values(bundle)) {
          if (isSrc.test(out.fileName))
            out.fileName = out.fileName.replace("src/client/pages/", "");
        }
      },
    },
    {
      name: "dev-tree",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const redirect = /(?<!src[\w\/]*)((\/\w+\/$)|(\/\w+.js$))/;
          if (redirect.test(req.url)) req.url = `/src/client/pages${req.url}`;
          next();
        });
      },
      resolveId(id) {
        const redirect = /(?<!src[\w\/]*)(\/\w+.js$)/;
        return redirect.test(id)
          ? resolve(__dirname, `./src/client/pages/${id}`)
          : null;
      },
    },
  ],
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
      { find: "~", replacement: resolve(__dirname, "./src/client") },
      { find: "#", replacement: resolve(__dirname, "./src/client/pages") },
    ],
  },
  server: {
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: ["./index.html", ...glob("./src/client/**/*.html")],
      output: {
        dir: "dist",
        format: "esm",
        manualChunks: {
          axios: ["axios"],
          utils: ["stream", "util", "buffer", "randombytes"],
          crypto: ["crypto"],
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        arguments: true,
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
