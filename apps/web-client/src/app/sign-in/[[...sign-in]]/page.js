// apps/web-client/src/app/sign-in/[[...sign-in]]/page.js

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
      {/* Redirect to a protected page after sign-in */}
      <SignIn afterSignInUrl="/code-editor" />
    </div>
  );
}