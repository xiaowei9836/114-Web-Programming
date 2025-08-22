module.exports = {
  apps: [
    {
      name: 'trip-planner-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'dist'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'trip-planner-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development'
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'dist'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
};
