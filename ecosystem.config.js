
module.exports = {
  apps : [{
    name: "attendance-machine-api",      
    script: "dist/app.js",
    instances: "max",
    exec_mode: "cluster",        
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3004
    },
  }]
};