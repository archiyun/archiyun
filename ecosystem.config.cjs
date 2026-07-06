module.exports = {
  apps: [
    {
      name: 'akiba-miku',
      script: '.output/server/index.mjs',
      cwd: '/home/ubuntu/projects/akiba-miku',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=2048',
        PORT: 3000,
      },
      max_memory_restart: '2G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
