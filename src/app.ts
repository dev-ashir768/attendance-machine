import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { rateLimiter } from './middlewares/rateLimit.middleware';
import v1Routes from './routes/v1';
import iclockRoutes from './routes/iclock.routes';
import { cronService } from './services/cron.service';

const app = express();

app.use(cors()); // Allow all origins (*)
app.use(express.json());

// ADMS Protocol relies on raw text payloads rather than JSON
app.use('/iclock', express.text({ type: '*/*' }), iclockRoutes);

// Main App Rate limiting (e.g. 100 requests per minute)
app.use(rateLimiter({ windowMs: 60 * 1000, max: 100 }));

app.use('/api/v1', v1Routes);

app.use(errorHandler);

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start cron jobs
  cronService.start();
});
