import { redirect } from "next/navigation";

// "Sign up" for a guild means onboarding + KYB.
export default function SignupRedirect() {
  redirect("/onboard");
}
