module.exports = {
  apps: [
    {
      name: "devstackio",
      script: "server.js",
      cwd: ".",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Environment variables should come from the shell environment, not hardcoded
      // Set them in .env or in the shell before starting PM2
      env_file: ".env",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      max_memory_restart: "500M",
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      watch: false,
      autorestart: true,
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },
  ],
};
