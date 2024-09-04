import { resolve } from "node:path";
import url from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist",
    // These targets are not "support".
    // A consuming app or library should compile further if they need to support
    // old browsers.
    target: ["esnext"],
    minify: false,
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "ember-deep-tracked",
      formats: ["es"],
      // the proper extensions will be added
      fileName: "index",
    },
    rollupOptions: {
      external: ["ember-tracked-storage-polyfill"],
    },
  },
  plugins: [
    dts({
      rollupTypes: false,
    }),
  ],
});
