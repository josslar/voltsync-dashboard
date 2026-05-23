import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Zap } from "lucide-react";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — VOLTREX" }] }),
});

function LoginPage() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 650));
    login(email);
    navigate({ to: "/dashboard" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-6"
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="panel rounded-2xl p-8 w-full max-w-md glow-primary"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center ring-pulse">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight text-glow">VOLTREX</div>
            <div className="text-xs text-muted-foreground">Intelligent Power Control</div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to access the grid console.
        </p>

        <form onSubmit={handle} className="space-y-4">
          <Field label="Email">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@voltrex.io"
              className="w-full bg-input/40 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-input/40 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition"
            />
          </Field>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg py-2.5 transition glow-primary disabled:opacity-60"
          >
            {loading ? "Authenticating…" : "Enter VOLTREX"}
          </motion.button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Demo mode — any email + password works.
        </p>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
