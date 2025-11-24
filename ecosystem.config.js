module.exports = {
    apps: [
        {
            name: "camelot",
            script: "build/camelot.js",
            node_args: "--max-old-space-size=8192",
            autorestart: true,
            max_restarts: 5,
            restart_delay: 5000,
            watch: false,
            // env: {
            //     NODE_ENV: "production",
            // },
        },
    ],
};
