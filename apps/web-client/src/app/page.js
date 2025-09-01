// apps/web-client/src/app/page.js

import Link from 'next/link';
// THE FIX IS HERE: We import server functions and client components separately.
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

const HomePage = () => {
  // This helper from Clerk gets the user's session information on the server.
  const { userId } = auth();

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-3xl text-center">
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 mb-10">
            <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Synapse</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300">
                Your AI-powered code companion, designed to help you learn, debug, and build faster.
            </p>
        </div>

        {/* Call to Action Button */}
        <div className="mt-8">
            <Link 
                href={userId ? "/editor" : "/sign-up"}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 duration-300 inline-block"
            >
                Get Started
            </Link>
        </div>

        {/* Description Section */}
        <div className="mt-16 text-left grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold mb-2 text-green-400">Intelligent Suggestions</h3>
                <p className="text-slate-400">Go beyond simple autocompletion. Synapse analyzes your code's context to provide smart, relevant suggestions and identify potential errors before you even run your code.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold mb-2 text-green-400">Personalized Learning</h3>
                <p className="text-slate-400">Our ML models learn your unique coding habits, identifying your common mistakes and strengths to provide a personalized learning path, helping you improve over time.</p>
            </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;