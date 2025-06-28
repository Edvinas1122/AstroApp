// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    },
  }),

  vite: {
    server: {
      allowedHosts: [
        'dev.edvinas.online'
      ]
    }
  },

  integrations: [preact()]
});