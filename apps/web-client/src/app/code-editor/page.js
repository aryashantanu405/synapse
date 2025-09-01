// apps/web-client/src/app/editor/page.js

'use client';
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// Mock data for the file explorer
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

    const activeFile = files[fileName];

    const handleFileSelect = (file) => {
        setFileName(file.name);
        setCode(file.value);
        setLanguage(file.language);
        setOutput(null); // Clear output when switching files
    };
    
    // The handleRunCode function is now part of the main layout's navbar,
    // so it would need to be managed by a shared state (like Zustand or Context)
    // For now, we'll keep the logic here to ensure the page is functional.
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
    
    return (
        // The main container no longer needs its own header
        <main className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
            {/* The Header is removed from this page component */}
            
            <PanelGroup direction="vertical" className="flex-grow">
                {/* Top Section (File Explorer + Editor) */}
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
                        <Panel>
                            <Editor
                                path={activeFile.name}
                                defaultLanguage={activeFile.language}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                theme="vs-dark"
                                options={{ fontSize: 16, minimap: { enabled: false } }}
                            />
                        </Panel>
                    </PanelGroup>
                </Panel>
                
                <PanelResizeHandle className="h-2 bg-slate-800 hover:bg-blue-600 transition-colors duration-200 cursor-row-resize"/>

                {/* Bottom Section (Input + Output) */}
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