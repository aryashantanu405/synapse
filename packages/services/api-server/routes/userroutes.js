import express from 'express';
const router = express.Router();
import {
  getUsers,
  getUserByClerkId,
} from '../controllers/usercontrollers.js';

// Route for getting all users
router.route('/').get(getUsers);

// Route for getting a single user by their Clerk ID
router.route('/:clerkId').get(getUserByClerkId);

export default router;