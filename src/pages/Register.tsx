import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-black/30 p-6 rounded-xl border border-white/10"
      >
        <h1 className="text-2xl font-bold tracking-tight">Register</h1>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-white/10 rounded px-3 py-2 outline-none focus:border-white"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white/10 rounded px-3 py-2 outline-none focus:border-white"
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        <p className="text-sm text-zinc-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
