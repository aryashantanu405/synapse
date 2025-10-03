// apps/web-client/src/app/editor/page.js

'use client';
// SOCKET INTEGRATION: Import useEffect and useRef for managing the connection
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// SOCKET INTEGRATION: Import the useUser hook to get the logged-in user's ID
import { useUser } from '@clerk/nextjs';
// SOCKET INTEGRATION: Import the socket.io client library
import io from 'socket.io-client';


// Mock data for the file explorer (remains the same)
const files = {
  'main.cpp': {
    name: 'main.cpp',
    language: 'cpp',
    value: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << "Please enter your name: " << std::flush;\n    std::cin >> name;\n    std::cout << "Hello, " << name << "! Your C++ program ran successfully.";\n    return 0;\n}',
  },
  'Main.java': {
    name: 'Main.java',
    language: 'java',
    value: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.println("Please enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "! Your Java program ran successfully.");\n        scanner.close();\n    }\n}',
  },
  'main.py': {
    name: 'main.py',
    language: 'python',
    value: 'name = input("Please enter your name: ")\nprint(f"Hello, {name}! Your Python program ran successfully.")',
  },
};

const CodeEditorPage = () => {
    const [fileName, setFileName] = useState('main.cpp');
    const [code, setCode] = useState(files[fileName].value);
    const [language, setLanguage] = useState(files[fileName].language);
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // SOCKET INTEGRATION: Add state for the AI hint and connection status
    const [aiHint, setAiHint] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    // SOCKET INTEGRATION: Get user info from Clerk
    const { user } = useUser();
    
    // SOCKET INTEGRATION: Use a ref to hold the socket instance and a timer for debouncing
    const socketRef = useRef(null);
    const debounceTimer = useRef(null);

    // SOCKET INTEGRATION: This effect establishes and cleans up the WebSocket connection
    useEffect(() => {
        if (!user) return; // Don't connect if the user is not loaded yet

        const socket = io('http://localhost:4000'); // Connect to your api-server
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('WebSocket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        // Listen for hints coming back from the server
        socket.on('new_hint', (data) => {
            if (data.hint && data.hint !== "(No Hint)") {
                setAiHint(data.hint);
            } else {
                setAiHint(null);
            }
        });

        socket.on('hint_error', (error) => {
            console.error('Socket hint error:', error.message);
        });

        // Cleanup function to disconnect when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, [user]); // Reconnect if the user changes


    const activeFile = files[fileName];

    const handleFileSelect = (file) => {
        setFileName(file.name);
        setCode(file.value);
        setLanguage(file.language);
        setOutput(null);
        setAiHint(null); // Clear hint when switching files
    };
    
    const handleRunCode = async () => {
        setIsLoading(true);
        setOutput(null);
        const requestBody = { language, code, stdin };

        try {
            const response = await fetch('http://localhost:5000/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
            const result = await response.json();
            setOutput(result);
        } catch (error) {
            console.error("Failed to execute code:", error);
            setOutput({ success: false, error: "Failed to connect to the execution service." });
        } finally {
            setIsLoading(false);
        }
    };
    
    // SOCKET INTEGRATION: New handler for the editor's onChange event
    const handleEditorChange = (value) => {
        setCode(value || '');
        setAiHint(null); // Clear any existing hint immediately on typing

        // Debounce logic: wait for the user to stop typing for 1.5 seconds
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            if (socketRef.current && isConnected && user && value) {
                // After 1.5s, send the code to the server for a hint
                socketRef.current.emit('code_change', {
                    clerkId: user.id,
                    code_snippet: value,
                    language: language,
                });
            }
        }, 1500); // 1.5 second delay
    };
    
    return (
        <main className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
            
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
                {/* SOCKET INTEGRATION: Added a visual connection status indicator */}
                <div className="flex items-center gap-2" title={isConnected ? 'Real-time service connected' : 'Real-time service disconnected'}>
                    <div className={`w-3 h-3 rounded-full transition-colors ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-slate-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRunCode}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-md text-sm transition-all duration-200 flex items-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        {isLoading ? 'Running...' : 'Run'}
                    </button>
                </div>
            </div>

            <PanelGroup direction="vertical" className="flex-grow">
                <Panel defaultSize={70}>
                    <PanelGroup direction="horizontal">
                        <Panel defaultSize={20} minSize={15} className="bg-slate-800 flex flex-col">
                           <div className="p-2.5 border-b border-slate-700"><h2 className="font-semibold text-slate-300">Explorer</h2></div>
                           <div className="p-2 space-y-1">
                            {Object.values(files).map((file) => (
                                <div key={file.name} onClick={() => handleFileSelect(file)} className={`px-2 py-1 rounded-md cursor-pointer text-sm ${fileName === file.name ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>
                                    {file.name}
                                </div>
                            ))}
                           </div>
                        </Panel>
                        <PanelResizeHandle className="w-2 bg-slate-800 hover:bg-blue-600 transition-colors duration-200 cursor-col-resize" />
                        <Panel className="relative">
                            <Editor
                                path={activeFile.name}
                                defaultLanguage={activeFile.language}
                                value={code}
                                // SOCKET INTEGRATION: Use the new debounced handler
                                onChange={handleEditorChange}
                                theme="vs-dark"
                                options={{ fontSize: 16, minimap: { enabled: false } }}
                            />
                            {/* SOCKET INTEGRATION: UI to display the hint */}
                            {aiHint && (
                                <div className="absolute bottom-4 right-4 bg-blue-900/80 border border-blue-700 text-blue-100 p-3 rounded-lg shadow-lg max-w-sm backdrop-blur-sm animate-pulse">
                                    <p className="font-semibold text-sm mb-1">💡 AI Suggestion</p>
                                    <p className="text-sm">{aiHint}</p>
                                </div>
                            )}
                        </Panel>
                    </PanelGroup>
                </Panel>
                
                <PanelResizeHandle className="h-2 bg-slate-800 hover:bg-blue-600 transition-colors duration-200 cursor-row-resize"/>

                <Panel defaultSize={30}>
                    <PanelGroup direction="horizontal">
                        <Panel className="bg-[#1e1e1e] flex flex-col">
                            <div className="p-2.5 bg-slate-800 border-b border-slate-700"><h2 className="font-semibold text-slate-300">Input (stdin)</h2></div>
                            <textarea
                                value={stdin}
                                onChange={(e) => setStdin(e.target.value)}
                                className="w-full h-full bg-[#1e1e1e] text-slate-200 p-4 font-mono text-sm focus:outline-none resize-none"
                                placeholder="Enter input for your program here..."
                            />
                        </Panel>
                        <PanelResizeHandle className="w-2 bg-slate-800 hover:bg-blue-600 transition-colors duration-200 cursor-col-resize" />
                        <Panel className="bg-[#1e1e1e] flex flex-col">
                            <div className="p-2.5 bg-slate-800 border-b border-slate-700"><h2 className="font-semibold text-slate-300">Output</h2></div>
                            <div className="p-4 overflow-y-auto flex-grow font-mono text-sm">
                                {!output && <div className="text-slate-500">Click "Run" to see the output...</div>}
                                {output && (
                                    <div className={`whitespace-pre-wrap break-words ${output.success ? 'text-green-400' : 'text-red-400'}`}>
                                        {output.success ? output.output : output.error}
                                    </div>
                                )}
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </main>
    );
};

export default CodeEditorPage;