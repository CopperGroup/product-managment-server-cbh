// src/routes/authRoutes.ts
import { Router } from 'express';
import { handleClerkWebhook } from '../controllers/authController';

const router = Router();

// Route for Clerk webhooks
// This route should NOT be protected by clerkMiddleware or protect,
// as it's an incoming event from Clerk that needs to be verified internally.
router.post('/webhook', handleClerkWebhook);

export default router;