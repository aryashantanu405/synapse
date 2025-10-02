import express from "express";
const router = express.Router();
import {
  getUsers,
  getUserByClerkId,
  analyzeUserArchetype,
  getPredictiveHint,
  generateCodeHint,
} from "../controllers/usercontrollers.js";

// Route for getting all users
router.route("/").get(getUsers);

// Route for getting a single user by their Clerk ID
router.route("/:clerkId").get(getUserByClerkId);

// This endpoint will trigger the analysis for a specific user.
router.route("/:clerkId/analyze").post(analyzeUserArchetype);
//This is the endpoint for getting predictive hints for llm from random forests
router.route("/:clerkId/predict-hint").post(getPredictiveHint);
//This is the endpoint for getting hint from llm model
router.route("/:clerkId/generate-hint").post(generateCodeHint);

export default router;
