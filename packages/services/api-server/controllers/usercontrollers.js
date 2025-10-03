// packages/services/api-server/controllers/userController.js

import User from '../models/user.model.js';
import axios from 'axios';

// --- (Existing functions remain the same) ---
const getUsers = async (req, res) => { /* ... */ };
const getUserByClerkId = async (req, res) => { /* ... */ };
const analyzeUserArchetype = async (req, res) => { /* ... */ };
const generateCodeHint = async (req, res) => { /* ... */ };

// --- This is the function the route is missing ---
const syncUser = async (req, res) => {
  try {
    // --- THE FIX IS HERE ---
    // We are now destructuring the CORRECT properties from the Clerk user object.
    const { id, username, primaryEmailAddress, imageUrl } = req.body;

    if (!id || !primaryEmailAddress) {
      return res.status(400).json({ message: 'Clerk ID and primary email are required.' });
    }
    
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $setOnInsert: {
          clerkId: id,
          email: primaryEmailAddress.emailAddress, // Correctly access the nested email
          username: username,
          image: { url: imageUrl || '/path/to/your/placeholder-image.png' },
          userArchetype: 'Newbie',
        }
      },
      { upsert: true, new: true, runValidators: true }
    );
    
    console.log(`User ${id} synced successfully.`);
    res.status(200).json(user);

  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Error syncing user.' });
  }
};
const logUserActivity = async (req, res) => {
  try {
    const { eventType, details } = req.body;
    
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the event to the user's activity log (and cap it at 50 entries)
    user.activityLog.unshift({ eventType, details });
    if (user.activityLog.length > 50) {
      user.activityLog.pop();
    }

    // If the event was a failed execution, update the mistake patterns
    if (eventType === 'execution_failed' && details.mistakePatternId) {
      const patternId = details.mistakePatternId;
      const patternIndex = user.mistakePatterns.findIndex(p => p.patternId === patternId);

      if (patternIndex > -1) {
        // If the pattern already exists, increment its count
        user.mistakePatterns[patternIndex].occurrenceCount += 1;
        user.mistakePatterns[patternIndex].lastOccurrence = new Date();
      } else {
        // If it's a new mistake pattern, add it to the array
        user.mistakePatterns.push({
          patternId: patternId,
          language: details.language,
          description: "A new mistake was logged.", // Could be enhanced later
          occurrenceCount: 1,
          lastOccurrence: new Date(),
        });
      }
    }
    
    await user.save();
    res.status(200).json({ message: 'Activity logged successfully.' });

  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: 'Error logging activity.' });
  }
};

export { getUsers, getUserByClerkId, analyzeUserArchetype, generateCodeHint, syncUser,logUserActivity };