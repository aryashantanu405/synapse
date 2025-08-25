import Project from '../models/project.model.js';
import User from '../models/user.model.js';

// @desc    Fetch all projects for a user
// @route   GET /api/projects
// @access  Private (we'll add auth later)
const getProjects = async (req, res) => {
  try {
    // For now, we'll fetch projects for our dummy "admin" user
    const user = await User.findOne({ email: 'alice@example.com' });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const projects = await Project.find({ owner: user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch a single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getProjects, getProjectById };