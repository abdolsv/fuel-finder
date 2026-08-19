import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows access from your phone browser at the device's local IP too
    port: 5173,
  },
});
