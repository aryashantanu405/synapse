'use client'; // Important: This directive marks the component as a Client Component

import { useState, useEffect } from 'react';

export default function TestPage() {
  // 1. Create a state variable to store the message from the backend
  const [message, setMessage] = useState('Loading...');

  // 2. useEffect hook runs after the component mounts
  useEffect(() => {
    // Define an async function to fetch the data
    const fetchData = async () => {
      try {
        // 3. Fetch data from your api-server's health check endpoint
        // Make sure the port matches your backend server's port
        const response = await fetch('http://localhost:4000/api/health');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // 4. Update the state with the message from the backend
        setMessage(data.message);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setMessage('Failed to connect to the backend.');
      }
    };

    fetchData(); // Call the function to execute the fetch
  }, []); // The empty array [] ensures this effect runs only once

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Testing Backend Connection</h1>
      <p>Status: {message}</p>
    </main>
  );
}
