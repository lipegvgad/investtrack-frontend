import { resolve } from "path";
import { defineConfig } from "vite";

// App multipágina: cada tela é um HTML próprio com seu módulo TypeScript.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        login: resolve(__dirname, "index.html"),
        register: resolve(__dirname, "register.html"),
        forgot: resolve(__dirname, "forgot-password.html"),
        reset: resolve(__dirname, "reset-password.html"),
        app: resolve(__dirname, "app.html"),
      },
    },
  },
  server: {
    port: 5173,
  },
});
