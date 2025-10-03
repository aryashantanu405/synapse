// apps/web-client/src/components/ClerkSync.js

'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

const ClerkSync = () => {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const hasSynced = sessionStorage.getItem(`user_synced_${user.id}`);
      
      if (!hasSynced) {
        console.log("User is signed in, attempting to sync with backend...");
        
        // --- THE FIX IS HERE ---
        // We now construct the full URL to the api-server.
        const syncUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`;
        
        fetch(syncUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // The body of the request is the full user object from Clerk.
          // Note: Clerk's user object doesn't contain the raw 'data' property.
          body: JSON.stringify(user), 
        })
        .then(response => {
          if (!response.ok) {
            // Log the actual server error for better debugging
            console.error('Server responded with an error:', response.status);
            throw new Error('Sync request failed');
          }
          return response.json();
        })
        .then(data => {
          console.log('User synced successfully:', data);
          sessionStorage.setItem(`user_synced_${user.id}`, 'true');
        })
        .catch(error => console.error('Error syncing user:', error));
      }
    }
  }, [isSignedIn, user]);

  return null;
};

export default ClerkSync;