// packages/services/api-server/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import {
  getUsers,
  getUserByClerkId,
  analyzeUserArchetype,
  generateCodeHint, // <-- THE FIX: Use the correct function name here
} from '../controllers/usercontrollers.js'; // <-- Also fixed the filename typo

// Existing routes...
router.route('/').get(getUsers);
router.route('/:clerkId').get(getUserByClerkId);
router.route('/:clerkId/analyze').post(analyzeUserArchetype);

// THE FIX: And use the correct function name here
router.route('/:clerkId/generate-hint').post(generateCodeHint);

export default router;