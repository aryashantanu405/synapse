import User from '../models/user.model.js';

// @desc    Fetch all users
// @route   GET /api/users
// @access  Public (for now)
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
// @access  Public (for now)
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

export { getUsers, getUserByClerkId };