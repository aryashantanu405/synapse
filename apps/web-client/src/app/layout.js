// apps/web-client/src/app/layout.js (or a nested layout file)

import { ClerkProvider, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import './globals.css'; // Make sure your globals.css is imported

export const metadata = {
  title: 'Synapse Cognitive Coder',
  description: 'The AI-powered code editor that helps you learn.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-slate-900 text-slate-100">
          <div className="flex flex-col h-screen">
            {/* --- The New Navbar --- */}
            <header className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700 shadow-md flex-shrink-0">
              <div className="flex items-center gap-6">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <h1 className="text-2xl font-bold text-slate-200">Synapse</h1>
                </div>
                {/* Navigation Links */}
                <nav className="flex items-center gap-4">
                  <Link href="/code-editor" className="text-slate-300 hover:text-white transition-colors">
                    Editor
                  </Link>
                  <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </nav>
              </div>

              {/* Right side of Navbar */}
              <div className="flex items-center gap-4">
                {/* This is where the UserButton from Clerk will go */}
                <UserButton afterSignOutUrl="/" />
              </div>
            </header>

            {/* --- Page Content --- */}
            <main className="flex-grow overflow-hidden">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}