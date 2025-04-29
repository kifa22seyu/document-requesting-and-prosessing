import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Optional: Explicitly define env prefix if needed
  envPrefix: 'VITE_'
});