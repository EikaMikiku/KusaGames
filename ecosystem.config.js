module.exports = {
  apps: [{
    name: "KusaGames",
    script: "./index.js",
    watch: ["./server"],
    watch_delay: 1000,
    ignore_watch : ["node_modules"],
    out_file: "./pm2/out.log",
    error_file: "./pm2/error.log",
    pid_file: "./pm2/pm2.log",
    log_date_format: "YYYY-MM-DD HH:mm Z",
    autorestart: false
  }]
};