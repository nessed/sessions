import { useAuth } from "@/auth/AuthProvider";
import { Link } from "react-router-dom";

const VerifyEmail = () => {
  const { pendingEmail } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md space-y-4 bg-black/30 p-6 rounded-xl border border-white/10 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-zinc-300">
          We sent a verification link to {pendingEmail || "your email"}. Please
          verify to activate your account.
        </p>
        <div className="text-sm text-zinc-400">
          Already verified? <Link to="/login" className="text-white underline">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
