import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

// --- Basic Setup ---
const app = express();
const docker = new Docker();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Helper Function to Create Temporary Code Files ---
const generateFile = async (language, code) => {
  const jobId = uuid();
  const tempDir = path.join(__dirname, 'temp', jobId);
  fs.mkdirSync(tempDir, { recursive: true });

  let filename;
  // Determine filename based on language. Java is strict about this.
  switch (language) {
    case 'cpp':
      filename = 'main.cpp';
      break;
    case 'java':
      filename = 'Main.java'; // Java class name must match filename
      break;
    case 'python':
      filename = 'main.py';
      break;
    default:
      throw new Error('Unsupported language');
  }

  const filepath = path.join(tempDir, filename);
  await fs.writeFileSync(filepath, code);
  return { filepath, tempDir };
};

// --- Language-Specific Execution Handlers ---

const executeCpp = async (tempDir) => {
  const imageName = 'cpp-toolbox';
  const command = `g++ main.cpp -o main && ./main`;
  
  const [output, container] = await docker.run(imageName, ['sh', '-c', command], process.stdout, {
    HostConfig: {
      AutoRemove: true,
      Binds: [`${tempDir}:/app`],
    },
  });

  // docker.run doesn't stream stderr well, so we need to get logs to see compiler errors
  const logs = await container.logs({ stdout: true, stderr: true });
  const logString = logs.toString('utf8');

  // If status code is not 0, it means there was an error.
  if (output.StatusCode !== 0) {
      return { error: logString };
  }
  return { output: logString };
};

const executeJava = async (tempDir) => {
    const imageName = 'java-toolbox';
    const command = `javac Main.java && java Main`;
  
    const [output, container] = await docker.run(imageName, ['sh', '-c', command], process.stdout, {
      HostConfig: {
        AutoRemove: true,
        Binds: [`${tempDir}:/app`],
      },
    });

    const logs = await container.logs({ stdout: true, stderr: true });
    const logString = logs.toString('utf8');
  
    if (output.StatusCode !== 0) {
        return { error: logString };
    }
    return { output: logString };
};
  
const executePython = async (tempDir) => {
    const imageName = 'python-toolbox';
    const command = `python3 main.py`;
  
    const [output, container] = await docker.run(imageName, ['sh', '-c', command], process.stdout, {
      HostConfig: {
        AutoRemove: true,
        Binds: [`${tempDir}:/app`],
      },
    });

    const logs = await container.logs({ stdout: true, stderr: true });
    const logString = logs.toString('utf8');
  
    if (output.StatusCode !== 0) {
        return { error: logString };
    }
    return { output: logString };
};
  
// --- Main API Endpoint ---
app.post('/execute', async (req, res) => {
  const { language, code } = req.body;

  if (language === undefined) {
    return res.status(400).json({ success: false, error: 'Language is required.' });
  }
  if (code === undefined) {
    return res.status(400).json({ success: false, error: 'Empty code body is required.' });
  }

  let tempDir;
  try {
    const { tempDir: createdTempDir } = await generateFile(language, code);
    tempDir = createdTempDir;
    let result;

    // The switch case structure to choose the correct handler
    switch (language) {
      case 'cpp':
        result = await executeCpp(tempDir);
        break;
      case 'java':
        result = await executeJava(tempDir);
        break;
      case 'python':
        result = await executePython(tempDir);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported language' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    // Cleanup the temporary directory
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

// --- Start the Server ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Code Execution Service listening on http://localhost:${PORT}`);
});