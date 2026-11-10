"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppAuth } from "@/hooks/useAppAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = login(username, password);
    if (!ok) {
      setError(true);
      return;
    }
    const redirect = searchParams.get("redirect");
    router.push(redirect && redirect.startsWith("/") ? redirect : "/");
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-sm">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Accueil
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-400/10 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold">Accès protégé</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Section protégée, connecte-toi pour continuer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="app-username">Identifiant</Label>
              <Input
                id="app-username"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(false);
                }}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-password">Mot de passe</Label>
              <Input
                id="app-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">Identifiant ou mot de passe incorrect.</p>
            )}
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
