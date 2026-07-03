module.exports = {
  apps: [
    {
      name: "devstackio",
      script: "server.js",
      cwd: "./.next/standalone",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        ANALYTICS_URL: "",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      max_memory_restart: "500M",
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
    },
  ],
};
