import express from 'express';
const router = express.Router();
import {
  getProjects,
  getProjectById,
} from '../controllers/projectcontroller.js';

// Route for getting all projects
router.route('/').get(getProjects);

// Route for getting a single project by its ID
router.route('/:id').get(getProjectById);

export default router;