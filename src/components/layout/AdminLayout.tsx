import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  HeartHandshake,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/layout/PublicLayout";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const menu = [
  { label: "Visão geral", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Necessidades", to: "/admin/necessidades", icon: ListChecks, exact: false },
  { label: "Doações", to: "/admin/doacoes", icon: HeartHandshake, exact: false },
  { label: "Relatórios", to: "/admin/relatorios", icon: BarChart3, exact: false },
  { label: "Configurações", to: "/admin/configuracoes", icon: Settings, exact: false },
] as const;

function SidebarContentBlock({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5">
        <Logo tone="light" />
      </div>

      <nav aria-label="Menu administrativo" className="flex-1 space-y-1 px-3">
        {menu.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4 text-sm">
        <p className="font-medium">{user?.organization ?? "Escola Municipal Francisco Costa"}</p>
        <p className="text-xs text-sidebar-foreground/70">{user?.role ?? "Administrador"}</p>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate({ to: "/admin/login" });
          }}
          className="mt-4 flex items-center gap-2 rounded-md text-sm text-sidebar-foreground/85 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sair
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen space-y-4 p-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarContentBlock />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Abrir menu administrativo"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-0 p-0">
                  <SheetTitle className="sr-only">Menu administrativo</SheetTitle>
                  <SidebarContentBlock onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
              <p className="truncate text-sm font-medium text-muted-foreground">
                Painel administrativo • ReConecta TI
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Ver site público</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
