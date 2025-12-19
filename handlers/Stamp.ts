import express from 'express';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { updateUsersAndCache } from '../Modules/queries';

const handler: BotHandler = {
    name: "Stamp",
    once: true,
    execute: async (client: Client) => {

        const app = express();
        app.use(express.json());

        // Middleware to only accept requests from localhost
        app.use((req, res, next) => {
            const clientIP = req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
            const isLocalhost = clientIP === '127.0.0.1' ||
                clientIP === '::1' ||
                clientIP === '::ffff:127.0.0.1' ||
                req.hostname === 'localhost';

            if (!isLocalhost) {
                console.log(`Rejected request from non-localhost IP: ${clientIP}`);
                return res.status(403).json({ error: 'Access denied - localhost only' });
            };

            next();
        });

        // Endpoint to receive stamps from external app
        app.post('/stamps', async (req, res): Promise<any> => {
            if (client.user?.id !== "706183309943767112") return;

            try {
                const { userId, stamps } = req.body;

                // Validate input
                if (!userId || typeof userId !== 'string') {
                    return res.status(400).json({ error: 'userId is required and must be a string' });
                };

                if (stamps === undefined || stamps === null || typeof stamps !== 'number' || stamps < 0) {
                    return res.status(400).json({ error: 'stamps is required and must be a positive number' });
                };

                // Update user's stamps
                await updateUsersAndCache(client, userId, {
                    updates: {
                        stamps: { type: "increment", value: stamps },
                    },
                });

                console.log(`Added ${stamps} stamps to user ${userId}`);

                // Send success response
                res.status(200).json({
                    success: true,
                    message: 'Stamps added successfully',
                    userId: userId,
                    stampsAdded: stamps,
                });

            } catch (error) {
                console.error('Error processing stamps:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Health check endpoint
        app.get('/stamps/health', (req, res) => {
            res.status(200).json({ status: 'ok', message: 'Stamps handler is running' });
        });

        // Bind to localhost only and start the server
        const PORT = parseInt(process.env.STAMPS_PORT || '3001');
        app.listen(PORT, '127.0.0.1', () => {
            console.log(`Stamps handler listening on localhost:${PORT} (localhost only)`);
        });
    },
};

export default handler;
