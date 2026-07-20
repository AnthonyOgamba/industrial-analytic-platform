"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart3, Moon, Sun, Timer } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  skipLabel: string;
  heroTitle: string;
  heroDescription: string;
  showMetrics?: boolean;
};

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("divu-theme", next ? "dark" : "light");
    setDark(next);
  };
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDark(document.documentElement.classList.contains("dark")));
    const shortcut = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("keydown", shortcut); };
  }, []);
  return (
    <button className="auth-theme" type="button" onClick={toggle} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} title="Toggle theme (Alt+T)">
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}

export function AuthPageLayout({ children, skipLabel, heroTitle, heroDescription, showMetrics = true }: Props) {
  return (
    <div className="auth-page">
      <a className="auth-skip" href="#auth-form">{skipLabel}</a>
      <div className="auth-accent" />
      <header className="auth-header">
        <Link href="/login" aria-label="DIVU Analytics login">
          <Image src="/assets/divu-auth-logo.png" alt="DIVU Analytics" width={120} height={68} priority className="auth-logo auth-logo-light" />
          <Image src="/assets/divu-auth-logo-white.png" alt="" width={120} height={68} priority className="auth-logo auth-logo-dark" aria-hidden="true" />
        </Link>
        <nav aria-label="Public navigation">
          <Link href="/login">Home</Link>
          {/* TODO: Replace section anchors with approved product and legal URLs. */}
          <a className="auth-secondary-link" href="#auth-footer">About</a>
          <a className="auth-secondary-link" href="#auth-footer">Blog</a>
          <a className="auth-secondary-link" href="#auth-footer">Contact Us</a>
          <a className="auth-secondary-link" href="#auth-footer">FAQ</a>
          <Link className="auth-secondary-link" href="/login">Login</Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="auth-main">
        <section className="auth-form-pane" id="auth-form">{children}</section>
        <section className="auth-hero" aria-label="DIVU Analytics platform overview">
          <Image src="/assets/login-hero.png" alt="DIVU Analytics industrial dashboard showing live performance charts and operational records" fill priority sizes="(min-width: 901px) 50vw, 0px" className="auth-hero-image" />
          <div className="auth-hero-copy">
            <h2>{heroTitle}</h2>
            <p>{heroDescription}</p>
            {showMetrics && <div className="auth-metrics">
              <div><BarChart3 aria-hidden="true" /><span><small>Annual Growth</small><strong>+124%</strong></span></div>
              <div><Timer aria-hidden="true" /><span><small>Processing</small><strong>&lt; 20ms</strong></span></div>
            </div>}
          </div>
        </section>
      </main>
      <AuthFooter />
    </div>
  );
}

function AuthFooter() {
  const languages = ["English (UK)", "Francais (Canada)", "Espanol", "Deutsch", "Italiano", "Portugues (Brasil)"];
  const links = ["Sign up", "Log in", "About", "Careers", "Developers", "Privacy", "Cookies", "AdChoices", "Terms", "Help", "Contact Uploading & Non-Users"];
  return (
    <footer className="auth-footer" id="auth-footer">
      <div className="auth-footer-row">{languages.map((item) => <span key={item}>{item}</span>)}<button type="button" title="More languages" aria-label="More languages">+</button></div>
      <div className="auth-footer-rule" />
      <div className="auth-footer-row">{links.map((item) => item === "Log in" ? <Link key={item} href="/login">{item}</Link> : <span key={item}>{item}</span>)}</div>
      <p>Divu Analytics (c) 2024</p>
    </footer>
  );
}
