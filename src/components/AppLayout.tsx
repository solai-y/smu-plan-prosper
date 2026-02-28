import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Calendar, CheckCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Modules", icon: BookOpen },
  { to: "/timetable", label: "Timetable", icon: Calendar },
  { to: "/progress", label: "Progress", icon: CheckCircle },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-primary">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
            <span className="text-lg font-bold text-primary-foreground">SMUP</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-primary-foreground/70 hover:bg-sidebar-accent hover:text-primary-foreground",
                    location.pathname === item.to && "bg-sidebar-accent text-primary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
            <div className="ml-2 border-l border-sidebar-border pl-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="gap-2 text-primary-foreground/70 hover:bg-sidebar-accent hover:text-primary-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </nav>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}
