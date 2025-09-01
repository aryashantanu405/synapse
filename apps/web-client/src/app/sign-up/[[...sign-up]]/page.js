import { SignUp } from "@clerk/nextjs";

export default function Page() {
  // This component handles the entire sign-up UI and logic.
  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp />
    </div>
  );
}