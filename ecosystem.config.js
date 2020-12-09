module.exports = {
  apps: [{
    name: "slack_monitoring",
    script: "./server_sm.js",
    watch: ["./.env"],
    // Delay between restart
    autorestart: true,
    watch_delay: 100,
    watch_options: {
      "followSymlinks": false
    }
  }]
}
