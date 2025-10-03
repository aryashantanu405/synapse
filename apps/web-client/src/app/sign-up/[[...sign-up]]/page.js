// apps/web-client/src/app/sign-up/[[...sign-up]]/page.js

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
       {/* Redirect to a protected page after sign-up */}
      <SignUp afterSignUpUrl="/code-editor" />
    </div>
  );
}