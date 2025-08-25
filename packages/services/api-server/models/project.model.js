import mongoose from 'mongoose';

// Define the schema for a single file within a project
const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '', // Default to an empty file
  },
  language: {
    type: String,
    required: true,
  },
}, { _id: false }); // _id: false prevents subdocuments from getting their own IDs

// Define the schema for the Project model
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required.'],
    },
    language: {
      type: String,
      required: [true, 'Primary project language is required.'],
      enum: ['python', 'java', 'cpp', 'javascript'], // Example list of supported languages
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // A direct reference to the user who owns the project
      required: true,
    },
    collaborators: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['editor', 'viewer'], // Define permissions for collaborators
        default: 'editor',
      },
    }],
    // Store the project's files as an array of subdocuments
    files: [fileSchema],
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create the model from the schema
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;
