import { defineConfig } from '@farmfe/core'
import less from '@farmfe/js-plugin-less'
import path from 'path'
export default defineConfig({
  plugins: ['@farmfe/plugin-react', less()],
  compilation: {
    resolve: {
      alias: {
        '@/': path.join(process.cwd(), 'src')
      },
    },
    external: ["node:fs"]
  },
});
