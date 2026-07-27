"use client";

import { createContext, useContext } from "react";

export type AuthLanguage = "en" | "fr" | "es" | "pa";

const dictionaries: Record<AuthLanguage, Record<string, string>> = {
  en: {
    home:"Home",about:"About",blog:"Blog",contact:"Contact Us",faq:"FAQ",login:"Login",
    username:"USERNAME",password:"PASSWORD",forgot:"Forgot?",usernamePlaceholder:"Enter your username",
    passwordPlaceholder:"Enter your password",signIn:"Sign In",signingIn:"Signing in...",
    sessionExpired:"Your session expired. Please sign in again.",required:"Enter your username and password.",
    failed:"Sign in failed.",annualGrowth:"Annual Growth",processing:"Processing",
    heroTitle:"Empower your decisions with real-time data insights.",
    heroDescription:"Join businesses using Divu Analytics to track performance, predict trends, and optimize operations across the globe.",
  },
  fr: {
    home:"Accueil",about:"À propos",blog:"Blog",contact:"Nous contacter",faq:"FAQ",login:"Connexion",
    username:"NOM D’UTILISATEUR",password:"MOT DE PASSE",forgot:"Oublié ?",usernamePlaceholder:"Entrez votre nom d’utilisateur",
    passwordPlaceholder:"Entrez votre mot de passe",signIn:"Se connecter",signingIn:"Connexion...",
    sessionExpired:"Votre session a expiré. Veuillez vous reconnecter.",required:"Entrez votre nom d’utilisateur et votre mot de passe.",
    failed:"La connexion a échoué.",annualGrowth:"Croissance annuelle",processing:"Traitement",
    heroTitle:"Renforcez vos décisions grâce aux données en temps réel.",
    heroDescription:"Utilisez DIVU Analytics pour suivre les performances, prévoir les tendances et optimiser les opérations.",
  },
  es: {
    home:"Inicio",about:"Acerca de",blog:"Blog",contact:"Contáctenos",faq:"Preguntas",login:"Iniciar sesión",
    username:"USUARIO",password:"CONTRASEÑA",forgot:"¿Olvidó?",usernamePlaceholder:"Ingrese su usuario",
    passwordPlaceholder:"Ingrese su contraseña",signIn:"Iniciar sesión",signingIn:"Iniciando sesión...",
    sessionExpired:"Su sesión expiró. Inicie sesión de nuevo.",required:"Ingrese su usuario y contraseña.",
    failed:"No se pudo iniciar sesión.",annualGrowth:"Crecimiento anual",processing:"Procesamiento",
    heroTitle:"Potencie sus decisiones con datos en tiempo real.",
    heroDescription:"Use DIVU Analytics para controlar el rendimiento, predecir tendencias y optimizar las operaciones.",
  },
  pa: {
    home:"ਮੁੱਖ ਪੰਨਾ",about:"ਸਾਡੇ ਬਾਰੇ",blog:"ਬਲੌਗ",contact:"ਸੰਪਰਕ ਕਰੋ",faq:"ਸਵਾਲ",login:"ਲੌਗ ਇਨ",
    username:"ਯੂਜ਼ਰਨੇਮ",password:"ਪਾਸਵਰਡ",forgot:"ਭੁੱਲ ਗਏ?",usernamePlaceholder:"ਆਪਣਾ ਯੂਜ਼ਰਨੇਮ ਦਰਜ ਕਰੋ",
    passwordPlaceholder:"ਆਪਣਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ",signIn:"ਲੌਗ ਇਨ",signingIn:"ਲੌਗ ਇਨ ਹੋ ਰਿਹਾ ਹੈ...",
    sessionExpired:"ਤੁਹਾਡਾ ਸੈਸ਼ਨ ਸਮਾਪਤ ਹੋ ਗਿਆ। ਦੁਬਾਰਾ ਲੌਗ ਇਨ ਕਰੋ।",required:"ਯੂਜ਼ਰਨੇਮ ਅਤੇ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ।",
    failed:"ਲੌਗ ਇਨ ਅਸਫਲ ਰਿਹਾ।",annualGrowth:"ਸਾਲਾਨਾ ਵਾਧਾ",processing:"ਪ੍ਰੋਸੈਸਿੰਗ",
    heroTitle:"ਰੀਅਲ-ਟਾਈਮ ਡਾਟਾ ਨਾਲ ਬਿਹਤਰ ਫੈਸਲੇ ਲਓ।",
    heroDescription:"ਕਾਰਗੁਜ਼ਾਰੀ ਦੇਖਣ, ਰੁਝਾਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕਰਨ ਅਤੇ ਕਾਰਜ ਸੁਧਾਰਨ ਲਈ DIVU Analytics ਵਰਤੋ।",
  },
};

const AuthLanguageContext=createContext({language:"en" as AuthLanguage,t:(key:string)=>dictionaries.en[key]??key});

export function AuthLanguageProvider({language,children}:{language:AuthLanguage;children:React.ReactNode}) {
  return <AuthLanguageContext.Provider value={{language,t:(key)=>dictionaries[language][key]??dictionaries.en[key]??key}}>{children}</AuthLanguageContext.Provider>;
}

export function useAuthLanguage(){return useContext(AuthLanguageContext)}
