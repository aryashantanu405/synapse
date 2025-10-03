// packages/services/code-execution-service/index.js

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// This helper function now simply runs a command and listens for its exit code.
const runCommand = (command, args, options = {}) => {
    return new Promise((resolve) => {
        // We REMOVED the 'timeout' option from spawn. The container will handle it.
        const process = spawn(command, args, options);

        let output = '';
        let errorOutput = '';

        process.stdout.on('data', (data) => { output += data.toString(); });
        process.stderr.on('data', (data) => { errorOutput += data.toString(); });

        process.on('error', (err) => {
            resolve({ success: false, error: `Execution failed to start: ${err.message}` });
        });

        process.on('close', (code) => {
            // --- THE KEY FIX IS HERE ---
            // The 'timeout' command in Linux exits with code 124 when it kills a process.
            // We specifically check for this code to identify a TLE.
            if (code === 124) {
                resolve({ success: false, error: 'Time Limit Exceeded (TLE). Your code took longer than 5 seconds to run.' });
            } else if (code === 0) {
                resolve({ success: true, output });
            } else {
                resolve({ success: false, error: errorOutput });
            }
        });

        if (options.input) {
            process.stdin.write(options.input);
            process.stdin.end();
        }
    });
};

app.post('/execute', async (req, res) => {
    const { language, code, stdin = '' } = req.body;
    if (!code || !language) {
        return res.status(400).json({ success: false, error: 'Language and code are required.' });
    }

    const uniqueId = uuid();
    const tempDir = path.join(process.cwd(), 'temp', uniqueId);
    await fs.mkdir(tempDir, { recursive: true });

    let result;
    const volumeMount = `${tempDir}:/app`;
    
    try {
        if (language === 'cpp') {
            await fs.writeFile(path.join(tempDir, 'main.cpp'), code);
            const compileArgs = ['run', '--rm', '-v', volumeMount, 'cpp-toolbox', 'sh', '-c', 'g++ main.cpp -o main'];
            const compileResult = await runCommand('docker', compileArgs);

            if (!compileResult.success) {
                result = compileResult;
            } else {
                // We wrap the execution command with 'timeout 5s'
                const runArgs = ['run', '--rm', '-i', '-v', volumeMount, 'cpp-toolbox', 'sh', '-c', 'timeout 5s ./main'];
                result = await runCommand('docker', runArgs, { input: stdin });
            }
        } else if (language === 'java') {
            await fs.writeFile(path.join(tempDir, 'Main.java'), code);
            const compileArgs = ['run', '--rm', '-v', volumeMount, 'java-toolbox', 'sh', '-c', 'javac Main.java'];
            const compileResult = await runCommand('docker', compileArgs);

            if (!compileResult.success) {
                result = compileResult;
            } else {
                const runArgs = ['run', '--rm', '-i', '-v', volumeMount, 'java-toolbox', 'sh', '-c', 'timeout 5s java Main'];
                result = await runCommand('docker', runArgs, { input: stdin });
            }
        } else if (language === 'python') {
            await fs.writeFile(path.join(tempDir, 'main.py'), code);
            const runArgs = ['run', '--rm', '-i', '-v', volumeMount, 'python-toolbox', 'sh', '-c', 'timeout 5s python3 main.py'];
            result = await runCommand('docker', runArgs, { input: stdin });
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