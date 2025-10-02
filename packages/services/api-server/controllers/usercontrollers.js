// packages/services/api-server/controllers/userController.js

import User from '../models/user.model.js';
import axios from 'axios';

// (getUsers and getUserByClerkId functions are here...)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
const getUserByClerkId = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const analyzeUserArchetype = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) { return res.status(404).json({ message: 'User not found' }); }
    const mistakePatternsDict = user.mistakePatterns.reduce((acc, pattern) => {
      acc[pattern.patternId] = pattern.occurrenceCount;
      return acc;
    }, {});
    const mlServiceUrl = 'http://localhost:8000/predict/archetype';
    const mlResponse = await axios.post(mlServiceUrl, { mistake_patterns: mistakePatternsDict });
    const { archetype } = mlResponse.data;
    user.userArchetype = archetype;
    await user.save();
    res.status(200).json({ clerkId: user.clerkId, archetype: user.userArchetype });
  } catch (error) {
    console.error("Error during analysis:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to analyze user archetype.' });
  }
};

const generateCodeHint = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { code_snippet, language } = req.body;
    if (!code_snippet || !language) {
      return res.status(400).json({ message: 'code_snippet and language are required.' });
    }
    const contextPayload = {
      userArchetype: user.userArchetype,
      currentLanguage: language,
      conceptMasteryScore: 0.3,
      timeInSession_minutes: 60,
      recentErrorCount: 2
    };
    const mlServiceUrl = 'http://localhost:8000/generate/hint';
    const mlResponse = await axios.post(mlServiceUrl, {
      language: language,
      code_snippet: code_snippet,
      context: contextPayload
    });
    res.status(200).json(mlResponse.data);
  } catch (error) {
    console.error("Error generating hint:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to generate hint.' });
  }
};

// --- THIS IS THE KEY EXPORT PART ---
export { getUsers, getUserByClerkId, analyzeUserArchetype, generateCodeHint };