"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart3, Moon, Sun, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthLanguageProvider, type AuthLanguage } from "./auth-language";

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
  const [language,setLanguage]=useState<AuthLanguage>("en");
  useEffect(()=>{// eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage((localStorage.getItem("divu-language") as AuthLanguage)||"en")
  },[]);
  function chooseLanguage(value:AuthLanguage){setLanguage(value);localStorage.setItem("divu-language",value);document.documentElement.lang=value}
  const copy={
    en:{home:"Home",about:"About",blog:"Blog",contact:"Contact Us",faq:"FAQ",login:"Login",heroTitle,heroDescription,growth:"Annual Growth",processing:"Processing"},
    fr:{home:"Accueil",about:"À propos",blog:"Blog",contact:"Nous contacter",faq:"FAQ",login:"Connexion",heroTitle:"Renforcez vos décisions grâce aux données en temps réel.",heroDescription:"Utilisez DIVU Analytics pour suivre les performances, prévoir les tendances et optimiser les opérations.",growth:"Croissance annuelle",processing:"Traitement"},
    es:{home:"Inicio",about:"Acerca de",blog:"Blog",contact:"Contáctenos",faq:"Preguntas",login:"Iniciar sesión",heroTitle:"Potencie sus decisiones con datos en tiempo real.",heroDescription:"Use DIVU Analytics para controlar el rendimiento, predecir tendencias y optimizar las operaciones.",growth:"Crecimiento anual",processing:"Procesamiento"},
    pa:{home:"ਮੁੱਖ ਪੰਨਾ",about:"ਸਾਡੇ ਬਾਰੇ",blog:"ਬਲੌਗ",contact:"ਸੰਪਰਕ ਕਰੋ",faq:"ਸਵਾਲ",login:"ਲੌਗ ਇਨ",heroTitle:"ਰੀਅਲ-ਟਾਈਮ ਡਾਟਾ ਨਾਲ ਬਿਹਤਰ ਫੈਸਲੇ ਲਓ।",heroDescription:"ਕਾਰਗੁਜ਼ਾਰੀ ਦੇਖਣ, ਰੁਝਾਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕਰਨ ਅਤੇ ਕਾਰਜ ਸੁਧਾਰਨ ਲਈ DIVU Analytics ਵਰਤੋ।",growth:"ਸਾਲਾਨਾ ਵਾਧਾ",processing:"ਪ੍ਰੋਸੈਸਿੰਗ"},
  }[language];
  return (
    <AuthLanguageProvider language={language}><div className="auth-page">
      <a className="auth-skip" href="#auth-form">{skipLabel}</a>
      <div className="auth-accent" />
      <header className="auth-header">
        <Link href="/login" aria-label="DIVU Analytics login">
          <Image src="/assets/divu-auth-logo.png" alt="DIVU Analytics" width={120} height={68} priority className="auth-logo auth-logo-light" />
          <Image src="/assets/divu-auth-logo-white.png" alt="" width={120} height={68} priority className="auth-logo auth-logo-dark" aria-hidden="true" />
        </Link>
        <nav aria-label="Public navigation">
          <Link href="/login">{copy.home}</Link>
          {/* TODO: Replace section anchors with approved product and legal URLs. */}
          <a className="auth-secondary-link" href="#auth-footer">{copy.about}</a>
          <a className="auth-secondary-link" href="#auth-footer">{copy.blog}</a>
          <a className="auth-secondary-link" href="#auth-footer">{copy.contact}</a>
          <a className="auth-secondary-link" href="#auth-footer">{copy.faq}</a>
          <Link className="auth-secondary-link" href="/login">{copy.login}</Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="auth-main">
        <section className="auth-form-pane" id="auth-form">{children}</section>
        <section className="auth-hero" aria-label="DIVU Analytics platform overview">
          <Image src="/assets/login-hero.png" alt="DIVU Analytics industrial dashboard showing live performance charts and operational records" fill priority sizes="(min-width: 901px) 50vw, 0px" className="auth-hero-image" />
          <div className="auth-hero-copy">
            <h2>{copy.heroTitle}</h2>
            <p>{copy.heroDescription}</p>
            {showMetrics && <div className="auth-metrics">
              <div><BarChart3 aria-hidden="true" /><span><small>{copy.growth}</small><strong>+124%</strong></span></div>
              <div><Timer aria-hidden="true" /><span><small>{copy.processing}</small><strong>&lt; 20ms</strong></span></div>
            </div>}
          </div>
        </section>
      </main>
      <AuthFooter language={language} onLanguageChange={chooseLanguage}/>
    </div></AuthLanguageProvider>
  );
}

function AuthFooter({language,onLanguageChange}:{language:AuthLanguage;onLanguageChange:(language:AuthLanguage)=>void}) {
  const languages:Array<{code:AuthLanguage;label:string}> = [{code:"en",label:"English (UK)"},{code:"fr",label:"Français (Canada)"},{code:"es",label:"Español"},{code:"pa",label:"ਪੰਜਾਬੀ"}];
  const links = ["Sign up", "Log in", "About", "Careers", "Developers", "Privacy", "Cookies", "AdChoices", "Terms", "Help", "Contact Uploading & Non-Users"];
  return (
    <footer className="auth-footer" id="auth-footer">
      <div className="auth-footer-row" aria-label="Interface language">{languages.map((item) => <button type="button" key={item.code} onClick={()=>onLanguageChange(item.code)} aria-pressed={language===item.code} className={`auth-language-button ${language===item.code?"font-bold text-primary underline":""}`}>{item.label}</button>)}</div>
      <div className="auth-footer-rule" />
      <div className="auth-footer-row">{links.map((item) => item === "Log in" ? <Link key={item} href="/login">{item}</Link> : <span key={item}>{item}</span>)}</div>
      <p>Divu Analytics (c) 2024</p>
    </footer>
  );
}
