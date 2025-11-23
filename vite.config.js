import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

import { resolve } from "path";

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        dev: process.env.NODE_ENV !== "production"
      },
      preprocess: vitePreprocess()
    }),
    {
      name: 'custom-build-message',
      // This hook runs after each successful build in watch mode
      closeBundle() {
        console.log('✨ Build completed successfully!\nGoto chrome://extensions -> load Unpacked -> ./Public -> hit refresh to reload extension after any changes \n');
        // You can add more logic here, like sending notifications, etc.
      },
    }
  ],

  build: {
    sourcemap: true,

    rollupOptions: {
      // MULTIPLE ENTRY POINTS (newtab, popup, options)
      input: {
        newtab: resolve(__dirname, "newtab.html"),
        popup: resolve(__dirname, "popup.html"),
        options: resolve(__dirname, "options.html"),
      },

      // Match your old bundle filenames
      output: {
        entryFileNames: "build/[name].bundle.js",
        chunkFileNames: "build/[name].js",
        assetFileNames: "build/[name].[ext]"
      }
    },

    outDir: "public",
    emptyOutDir: false
  },

  // Browser extensions do not support HMR
  server: {
    hmr: false
  }
});
