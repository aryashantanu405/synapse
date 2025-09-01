// packages/services/code-execution-service/index.js

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process'; // Use spawn instead of exec
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * A robust function to run code in a Docker container using spawn.
 * This gives us direct control over stdin, stdout, and stderr streams.
 * @param {string} imageName - The name of the Docker image to use.
 * @param {string[]} commandParts - The command and its arguments as an array.
 * @param {string} stdinData - The data to pipe to the container's standard input.
 * @returns {Promise<{success: boolean, output?: string, error?: string}>}
 */
const runInContainer = (imageName, tempDir, commandParts, stdinData) => {
  return new Promise((resolve) => {
    const args = [
      'run',
      '--rm', // Automatically remove the container when it exits
      '-i',   // Keep stdin open so we can write to it
      '-v', `${tempDir}:/app`, // Mount the volume
      imageName,
      ...commandParts
    ];

    const dockerProcess = spawn('docker', args);

    let output = '';
    let errorOutput = '';

    // Listen for data coming from the container's standard output
    dockerProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Listen for data coming from the container's standard error
    dockerProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // This event fires when the container has finished its process
    dockerProcess.on('close', (code) => {
      if (code === 0) {
        // Exit code 0 means success
        resolve({ success: true, output });
      } else {
        // Any other exit code means an error occurred
        resolve({ success: false, error: errorOutput });
      }
    });

    // Handle potential errors when spawning the process itself
    dockerProcess.on('error', (err) => {
      resolve({ success: false, error: `Failed to start container: ${err.message}` });
    });

    // Write the user's input to the container's stdin and then close it.
    // This "hangs up the phone" and signals the end of input.
    dockerProcess.stdin.write(stdinData);
    dockerProcess.stdin.end();
  });
};

app.post('/execute', async (req, res) => {
  const { language, code, stdin = '' } = req.body;
  if (!code || !language) {
    return res.status(400).json({ success: false, error: 'Language and code are required.' });
  }

  const uniqueId = uuid();
  const tempDir = path.join(process.cwd(), 'temp', uniqueId);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    let result;

    if (language === 'cpp') {
      await fs.writeFile(path.join(tempDir, 'main.cpp'), code);
      // Compile Step
      const compileResult = await runInContainer('cpp-toolbox', tempDir, ['sh', '-c', 'g++ main.cpp -o main'], '');
      if (!compileResult.success) {
        return res.json(compileResult);
      }
      // Run Step
      result = await runInContainer('cpp-toolbox', tempDir, ['sh', '-c', './main'], stdin);
    } else if (language === 'java') {
      await fs.writeFile(path.join(tempDir, 'Main.java'), code);
      // Compile Step
      const compileResult = await runInContainer('java-toolbox', tempDir, ['sh', '-c', 'javac Main.java'], '');
      if (!compileResult.success) {
        return res.json(compileResult);
      }
      // Run Step
      result = await runInContainer('java-toolbox', tempDir, ['sh', '-c', 'java Main'], stdin);
    } else if (language === 'python') {
      await fs.writeFile(path.join(tempDir, 'main.py'), code);
      // Run Step (interpreted)
      result = await runInContainer('python-toolbox', tempDir, ['python3', 'main.py'], stdin);
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported language.' });
    }

    res.json(result);

  } catch (e) {
    res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Cleanup failed:", err));
  }
});

app.listen(port, () => {
  console.log(`🚀 Code Execution Service listening on http://localhost:${port}`);
});