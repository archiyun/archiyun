module.exports = {
  apps: [
    {
      name: 'archiyun',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/ubuntu/projects/archiyun/XHBlogs',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=2048',
      },
      max_memory_restart: '2G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
