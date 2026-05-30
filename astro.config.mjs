import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/Pucara-Turismo',
  base: '/Pucara-Turismo',
  integrations: [react()],
  output: 'static',
  integrations: [react()],

  output: 'static',

  build: {
    format: 'directory',
  },

  vite: {
    resolve: {
      alias: {
        '@styles': '/src/styles'
      }
    },
    plugins: [tailwindcss()],
    ssr: {
      external: ['sharp']
    }
  },

  image: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.unsplash.com' }
    ]
  },

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'github-dark' }
  },
});

