// packages/services/api-server/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import {
  getUsers,
  getUserByClerkId,
  analyzeUserArchetype,
  generateCodeHint,
  syncUser,
  logUserActivity // Make sure syncUser is imported
} from '../controllers/usercontrollers.js'; // Ensure correct path

// Existing routes...
router.route('/').get(getUsers);
router.route('/:clerkId').get(getUserByClerkId);
router.route('/:clerkId/analyze').post(analyzeUserArchetype);
router.route('/:clerkId/generate-hint').post(generateCodeHint);

// --- THE FIX IS HERE ---
// This line was missing. It connects the '/sync' path to the syncUser function.
router.route('/sync').post(syncUser);

router.route('/:clerkId/log-activity').post(logUserActivity);

export default router;