import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

// --- DUMMY DATA ---
const users = [
  {
    clerkId: 'user_2iABCDEfgHijKLMnoPQRstuvw',
    name: 'Alice Johnson',
    username: 'alice_dev',
    email: 'alice@example.com',
    image: { url: '/path/to/your/placeholder-image.png' },
  },
  {
    clerkId: 'user_3jBCDEfghIjkLMNPQRSTuvwx',
    name: 'Bob Williams',
    username: 'bob_codes',
    email: 'bob@example.com',
    image: { url: '/path/to/your/placeholder-image.png' },
  },
];

const importData = async () => {
  try {
    // Clear existing data
    await Project.deleteMany();
    await User.deleteMany();

    // Insert new users
    const createdUsers = await User.insertMany(users);
    console.log('Users Imported!');

    // Get admin user ID to assign as project owner
    const adminUser = createdUsers[0]._id;

    // Create a sample project for the first user
    const sampleProject = {
      name: 'My First Python Project',
      language: 'python',
      owner: adminUser,
      files: [
        {
          name: 'main.py',
          content: 'print("Hello, Synapse!")',
          language: 'python',
        },
      ],
    };

    await Project.create(sampleProject);
    console.log('Sample Project Imported!');

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Project.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destruction: ${error}`);
    process.exit(1);
  }
};

// Check command line arguments to decide which function to run
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}