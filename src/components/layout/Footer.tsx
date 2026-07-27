import { GraduationCap, Twitter, Linkedin, Github, Youtube } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { Wordmark } from "@/components/Wordmark";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how" },
      { label: "Universities", href: "/#universities" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
    ],
  },
];

export function Footer() {
  const { navigate } = useApp();
  const go = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
    } else {
      navigate(href);
    }
  };
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              The AI-powered scholarship discovery platform that helps students worldwide find
              their perfect opportunity — all in one place.
            </p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600 transition hover:bg-brand-50 hover:text-brand-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-bold text-ink-900">{c.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => go(l.href)}
                      className="text-sm text-ink-500 transition hover:text-brand-600"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 text-sm text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} StudyMatch AI. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-brand-500" /> Made for students, everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
