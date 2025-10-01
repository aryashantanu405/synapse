// packages/services/api-server/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import {
  getUsers,
  getUserByClerkId,
  analyzeUserArchetype,
  getPredictiveHint,
  generateCodeHint, // 1. Import the new controller
} from '../controllers/usercontrollers.js';

// Route for getting all users
router.route('/').get(getUsers);

// Route for getting a single user by their Clerk ID
router.route('/:clerkId').get(getUserByClerkId);

// 2. ADD THIS NEW ROUTE
// This endpoint will trigger the analysis for a specific user.
router.route('/:clerkId/analyze').post(analyzeUserArchetype);
router.route('/:clerkId/predict-hint').post(getPredictiveHint);

router.route('/:clerkId/generate-hint').post(generateCodeHint);

export default router;