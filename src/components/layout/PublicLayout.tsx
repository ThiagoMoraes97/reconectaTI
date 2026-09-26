import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Início", to: "/" },
  { label: "Necessidades", to: "/necessidades" },
  { label: "Como funciona", to: "/como-funciona" },
  { label: "Sobre o projeto", to: "/sobre" },
  { label: "FAQ", to: "/faq" },
] as const;

export function Logo({ tone = "primary" }: { tone?: "primary" | "light" }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg",
          tone === "light" ? "bg-white/10 text-white" : "bg-primary text-primary-foreground",
        )}
      >
        <RefreshCw className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          tone === "light" ? "text-white" : "text-primary",
        )}
      >
        ReConecta<span className="text-secondary"> TI</span>
      </span>
    </span>
  );
}

function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent bg-background/95 backdrop-blur transition-shadow",
        scrolled && "border-border shadow-[var(--shadow-card)]",
      )}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:py-4">
        <Link to="/" aria-label="ReConecta TI — página inicial" className="min-w-0">
          <Logo />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary bg-primary/8" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="outline">
            <Link to="/admin/login">Acesso da escola</Link>
          </Button>
          <Button asChild>
            <Link to="/doar">Quero doar</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild size="sm">
            <Link to="/doar">Quero doar</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir menu de navegação">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="px-4 pt-4">
                <Logo />
              </div>
              <nav aria-label="Navegação principal" className="mt-6 flex flex-col gap-1 px-4">
                {navigation.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{ className: "bg-primary/8 text-primary" }}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/acompanhar"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-medium text-foreground"
                >
                  Acompanhar doação
                </Link>
              </nav>
              <div className="mt-6 flex flex-col gap-2 px-4">
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/doar">Quero doar</Link>
                </Button>
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/admin/login">Acesso da escola</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo tone="light" />
          <p className="mt-3 text-sm text-primary-foreground/80">
            Tecnologia que circula. Educação que transforma.
          </p>
        </div>

        <nav aria-label="Links do rodapé">
          <h2 className="text-sm font-semibold">Navegação</h2>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link to="/" className="hover:underline">
                Início
              </Link>
            </li>
            <li>
              <Link to="/necessidades" className="hover:underline">
                Necessidades
              </Link>
            </li>
            <li>
              <Link to="/como-funciona" className="hover:underline">
                Como funciona
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:underline">
                Sobre
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/acompanhar" className="hover:underline">
                Acompanhar doação
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm text-primary-foreground/80">
          <h2 className="text-sm font-semibold text-primary-foreground">Projeto direcionado à</h2>
          <p className="mt-3">
            Escola Municipal Francisco Costa
            <br />
            Miguel Pereira – RJ
          </p>
          <p className="mt-4 text-xs">
            Projeto acadêmico de extensão desenvolvido com finalidade educacional e social.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 ReConecta TI</p>
          <div className="flex gap-4">
            <Link to="/privacidade" className="hover:underline">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="hover:underline">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Ir para o conteúdo
      </a>
      <PublicHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
