import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  publicDir: "public",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        menu: resolve(__dirname, "menu.html"),
        sobre: resolve(__dirname, "sobre-nosotros.html"),
        contacto: resolve(__dirname, "contacto.html"),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
