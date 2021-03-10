import { Request, Response, Router } from 'express';
import logger from '../utils/Logger';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';

import UserAnalyticsRouter from "./UserAnalytics";

// Init router and path
const router = Router();

// Add sub-routes
router.use('/', UserAnalyticsRouter);

// Export the base-router
export default router;
