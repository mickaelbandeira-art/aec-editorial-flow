import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
    },
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      process: {
        env: {
          API_KEY: env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY,
          NODE_ENV: mode,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
