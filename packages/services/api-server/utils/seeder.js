// packages/services/api-server/utils/seeder.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path'; // Import the path module
import { fileURLToPath } from 'url'; // Helper to work with paths in ES modules

import connectDB from '../config/db.js';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';

// --- THE FIX IS HERE ---
// Construct the absolute path to the .env file in the parent directory
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
dotenv.config();

// Connect to DB
connectDB();

// --- (The rest of your seeder.js file remains exactly the same) ---

const users = [
  {
    clerkId: 'user_2iABCDEfgHijKLMnoPQRstuvw',
    username: 'alice_dev',
    email: 'alice@example.com',
    userArchetype: 'JavaNewbie',
    mistakePatterns: [
      { patternId: 'java.NullPointerException', language: 'java', occurrenceCount: 28 },
      { patternId: 'java.TypeMismatch', language: 'java', occurrenceCount: 20 }
    ]
  },
  {
    clerkId: 'user_3jBCDEfghIjkLMNOPqrstuvwx',
    username: 'bob_coder',
    email: 'bob@example.com',
    userArchetype: 'PointerStruggler (C++)',
    mistakePatterns: [
      { patternId: 'cpp.PointerErrors', language: 'cpp', occurrenceCount: 22 },
      { patternId: 'cpp.MemoryLeaks', language: 'cpp', occurrenceCount: 18 }
    ]
  },
];
const projects = [{ name: 'My First Java Project', language: 'java' }];

const importData = async () => {
  try {
    await User.deleteMany();
    await Project.deleteMany();
    const createdUsers = await User.insertMany(users);
    console.log('Users Imported!');
    const adminUserId = createdUsers[0]._id;
    const sampleProjects = projects.map(project => ({ ...project, owner: adminUserId }));
    await Project.insertMany(sampleProjects);
    console.log('Projects Imported!');
    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Project.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  console.log('Please specify --import or --destroy flag.');
  process.exit();
}