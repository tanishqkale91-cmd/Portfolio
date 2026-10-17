import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import leetcodeHandler from './api/leetcode.js';

// `base: './'` makes every built asset path relative, so the same build works both
// on Vercel (site served from the domain root) and on GitHub Pages (served from
// /<repo-name>/). If you only ever deploy to Vercel you can change this back to '/'.
export default defineConfig({
  base: './',
  plugins: [react(), {
    name: 'local-leetcode-api',
    configureServer(server) {
      server.middlewares.use('/api/leetcode', async (request, response) => {
        const apiResponse = {
          status(code) { response.statusCode = code; return this; },
          setHeader(name, value) { response.setHeader(name, value); },
          json(payload) { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(payload)); },
        };
        await leetcodeHandler(request, apiResponse);
      });
    },
  }],
  build: {
    // Keep the initial download light: the 3D section is code-split by React.lazy,
    // and this warning helps us notice if a chunk grows too large later.
    chunkSizeWarningLimit: 700,
  },
});
