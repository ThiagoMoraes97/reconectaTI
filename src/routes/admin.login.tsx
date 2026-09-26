import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/layout/PublicLayout";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Acesso da escola | ReConecta TI" },
      {
        name: "description",
        content: "Área restrita para a equipe da Escola Municipal Francisco Costa.",
      },
      { property: "og:title", content: "Acesso da escola | ReConecta TI" },
      { property: "og:description", content: "Entre para gerenciar necessidades e doações." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/admin" });
  }, [user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password, remember);
      toast.success("Acesso realizado.");
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="surface-warm flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link to="/" aria-label="ReConecta TI — página inicial">
        <Logo />
      </Link>

      <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h1 className="text-xl font-semibold text-foreground">Acesso da escola</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Área restrita à equipe responsável pelas doações.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1.5"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1.5"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(Boolean(checked))}
              />
              Lembrar de mim
            </label>
            <button
              type="button"
              className="text-sm text-primary underline-offset-2 hover:underline"
              onClick={() =>
                toast.info("Recuperação de senha será disponibilizada com o backend do projeto.")
              }
            >
              Esqueci minha senha
            </button>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
