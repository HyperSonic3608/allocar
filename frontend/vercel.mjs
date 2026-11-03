import { env } from 'node:process'

// Evaluated by Vercel with the environment for the selected deployment.
const backend = new URL(env.BACKEND_URL || 'https://backend-not-configured.invalid')
if (
  !env.BACKEND_URL ||
  backend.protocol !== 'https:' ||
  backend.username ||
  backend.password ||
  backend.pathname !== '/' ||
  backend.search ||
  backend.hash
) {
  throw new Error(
    'Configure BACKEND_URL com a origem HTTPS do Render, sem /api, credenciais ou parâmetros.',
  )
}

export const config = {
  framework: 'vite',
  installCommand: 'npm ci',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  rewrites: [
    { source: '/api/:path*', destination: `${backend.origin}/api/:path*` },
    { source: '/((?!api(?:/|$)).*)', destination: '/index.html' },
  ],
  headers: [
    { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
  ],
}
