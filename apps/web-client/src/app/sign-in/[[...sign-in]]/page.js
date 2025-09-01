import { SignIn } from "@clerk/nextjs";

export default function Page() {
  // This pre-built component from Clerk handles the entire sign-in UI and logic.
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn />
    </div>
  );
}