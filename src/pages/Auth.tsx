import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }
    setPending(true);
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName }, emailRedirectTo: `${window.location.origin}/` },
        });
    setPending(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (mode === "signup") setMessage("Account created. Your control tower is ready.");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="control-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-40" />
      <section className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-panel)] sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><span className="font-bold">V</span></div>
          <div><p className="font-semibold tracking-tight">VeriOS</p><p className="text-xs text-muted-foreground">Decision control tower</p></div>
        </div>
        <div className="mb-6"><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-primary">Secure workspace</p><h1 className="text-2xl font-semibold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="mt-2 text-sm text-muted-foreground">Sign in to review and govern your AI decisions.</p></div>
        <div className="mb-6 grid grid-cols-2 rounded-lg bg-muted p-1">
          {["login", "signup"].map((item) => <button key={item} type="button" onClick={() => { setMode(item as "login" | "signup"); setError(null); setMessage(null); }} className={cn("rounded-md px-3 py-2 text-sm transition-colors", mode === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{item === "login" ? "Sign in" : "Sign up"}</button>)}
        </div>
        <form className="space-y-4" onSubmit={submit}>
          {mode === "signup" && <div className="space-y-2"><Label htmlFor="display-name">Name</Label><Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Maya Chen" autoComplete="name" required /></div>}
          <div className="space-y-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          {message && <p role="status" className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{message}</p>}
          <Button className="w-full" type="submit" disabled={pending}>{pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}{mode === "login" ? "Enter workspace" : "Create workspace access"}</Button>
        </form>
      </section>
    </main>
  );
}
