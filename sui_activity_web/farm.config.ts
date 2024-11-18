import { defineConfig } from '@farmfe/core'
import less from '@farmfe/js-plugin-less'

export default defineConfig({
  plugins: ['@farmfe/plugin-react', less()],
  compilation: {
    // enable minification for both development and production
    minify: true,
  },
});
