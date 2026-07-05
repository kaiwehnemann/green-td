import { defineConfig } from 'vite';

// Repo is served from https://<user>.github.io/green-td/ on GitHub Pages,
// so assets must be referenced under that base path. Locally (dev) base is '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/green-td/' : '/',
}));
