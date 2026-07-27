import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { useTheme } from "@/store/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/Wordmark";

const links = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how" },
  { label: "Universities", href: "/#universities" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const { navigate, user } = useApp();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    if (path.startsWith("/#")) {
      const id = path.slice(2);
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
    } else {
      navigate(path);
    }
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "border-b border-ink-100 bg-white/85 backdrop-blur-lg dark:border-ink-800 dark:bg-ink-950/85" : "bg-transparent"}`}>
      <nav className="container-app flex h-16 items-center justify-between">
        <Wordmark />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button key={l.href} onClick={() => go(l.href)} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white">{l.label}</button>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {user ? (
            <Button onClick={() => go("/dashboard")} size="sm">Go to dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => go("/login")}>Log in</Button>
              <Button size="sm" onClick={() => go("/signup")}>Get started</Button>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 text-ink-700 dark:text-ink-200 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </nav>
      {open && (
        <div className="border-t border-ink-100 bg-white px-4 pb-4 pt-2 dark:border-ink-800 dark:bg-ink-950 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => <button key={l.href} onClick={() => go(l.href)} className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800">{l.label}</button>)}
            <div className="mt-2 flex items-center gap-2">
              <button onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
              {user ? (
                <Button fullWidth size="sm" onClick={() => go("/dashboard")}>Go to dashboard</Button>
              ) : (
                <>
                  <Button variant="outline" fullWidth size="sm" onClick={() => go("/login")}>Log in</Button>
                  <Button fullWidth size="sm" onClick={() => go("/signup")}>Get started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
