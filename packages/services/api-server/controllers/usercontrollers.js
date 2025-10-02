
import User from '../models/user.model.js';
import axios from 'axios'; // 1. Import axios

// @desc    Fetch all users
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch a single user by their Clerk ID
// @route   GET /api/users/:clerkId
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


// @desc    Analyze a user's archetype by calling the ML service
// @route   POST /api/users/:clerkId/analyze
const analyzeUserArchetype = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //Transform the mistakePatterns array into the format the ML API expects
    // From: [{ patternId: 'cpp.PointerErrors', occurrenceCount: 22 }, ...]
    // To:   { 'cpp.PointerErrors': 22, ... }
    const mistakePatternsDict = user.mistakePatterns.reduce((acc, pattern) => {
      acc[pattern.patternId] = pattern.occurrenceCount;
      return acc;
    }, {});

    
    const mlServiceUrl = process.env.ML_SERVICE_URI;
    const mlResponse = await axios.post(mlServiceUrl, {
      mistake_patterns: mistakePatternsDict,
    });

    const { archetype } = mlResponse.data;

    user.userArchetype = archetype;
    await user.save();

    res.status(200).json({
      clerkId: user.clerkId,
      archetype: user.userArchetype,
    });

  } catch (error) {
    console.error("Error during analysis:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to analyze user archetype.' });
  }
};
const getPredictiveHint = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Get the real-time context from the request body
    // (In the future, this will come from the editor via WebSockets)
    const {
      currentLanguage,
      conceptMasteryScore,
      timeInSession_minutes,
      recentErrorCount
    } = req.body;

    // Step 3: Construct the payload for the ml-service
    const requestPayload = {
      userArchetype: user.userArchetype, // The crucial data from our database!
      currentLanguage,
      conceptMasteryScore,
      timeInSession_minutes,
      recentErrorCount
    };

    const mlServiceUrl = process.env.ML_SERVICE_URI;
    const mlResponse = await axios.post(mlServiceUrl, requestPayload);

    res.status(200).json(mlResponse.data);

  } catch (error) {
    console.error("Error getting predictive hint:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to get predictive hint.' });
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

    // We combine persistent user data with temporary, real-time context.
    // For now, we'll use placeholder values for some real-time stats.
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

    // Step 5: Return the final hint from the ml-service to the client
    res.status(200).json(mlResponse.data);

  } catch (error) {
    console.error("Error generating hint:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to generate hint.' });
  }
};


// 3. Export the new function
export { getUsers, getUserByClerkId, analyzeUserArchetype,getPredictiveHint,generateCodeHint };