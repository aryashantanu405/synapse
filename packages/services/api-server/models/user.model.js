import mongoose from 'mongoose';

// Define the schema for the User model, designed for Clerk.dev integration
// and to store metadata for the AI/ML features.
const userSchema = new mongoose.Schema(
  {
    // --- Core Profile (from Clerk & initial setup) ---
    clerkId: {
      type: String,
      required: [true, 'Clerk User ID is required.'],
      unique: true,
    },
    githubId: {
      type: String, // To store the user's GitHub profile ID
      unique: true,
      sparse: true, // Allows null values, but ensures any provided ID is unique
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have a null value for username
    },
    email: {
      type: String,
      required: [true, 'Please provide an email.'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address.',
      ],
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        default: '/path/to/your/placeholder-image.png', // Default placeholder image
      },
    },

    // --- AI/ML Metadata ---
    codingStats: {
      primaryLanguages: [{
        language: String, // e.g., 'python', 'java'
        projectCount: { type: Number, default: 0 },
        lastUsed: Date,
      }],
      totalProjects: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      timeSpentCoding: { type: Number, default: 0 }, // in minutes
    },

    mistakePatterns: [{
      patternId: String, // A unique ID for the type of mistake, e.g., 'java.NullPointerException'
      language: String,
      description: String, // "Forgetting to check for null before accessing object properties"
      occurrenceCount: { type: Number, default: 1 },
      lastOccurrence: Date,
      relatedConcepts: [String], // e.g., ['optional-chaining', 'defensive-programming']
    }],

    strengths: [{
      conceptId: String, // e.g., 'python.listComprehension', 'cpp.pointers'
      language: String,
      description: String, // "Effectively uses list comprehensions for data manipulation"
      masteryScore: { type: Number, default: 0.1 }, // A score from 0 to 1
      lastDemonstrated: Date,
    }],
    
    // --- User Preferences & Activity ---
    preferences: {
        preferredTheme: { type: String, default: 'dark' },
        suggestionLevel: { 
            type: String, 
            enum: ['beginner', 'intermediate', 'expert'], 
            default: 'intermediate' 
        },
        notificationSettings: {
            weeklyReport: { type: Boolean, default: true },
            idiomaticTips: { type: Boolean, default: true },
        }
    },

    activityLog: [{
        eventType: String, // e.g., 'project_created', 'refactor_accepted', 'test_failed'
        timestamp: { type: Date, default: Date.now },
        details: mongoose.Schema.Types.Mixed // Flexible object for extra info
    }],


    // --- Relational Data (for future features like collaborations) ---
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// In your application logic, you should cap the activityLog to a reasonable size (e.g., last 50 events)
// to prevent the document from becoming too large.

// Create the model from the schema
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
