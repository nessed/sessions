import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const { pendingEmail } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md space-y-4 bg-black/30 p-6 rounded-xl border border-white/10 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-zinc-300">
          We’ve sent a confirmation link to {pendingEmail || "your email"}. Click
          the link in your inbox to verify your account, then come back here and
          log in.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-zinc-200 transition-colors"
        >
          Go to login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
