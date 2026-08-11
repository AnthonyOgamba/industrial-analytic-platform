import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DIVU Analytics",
    template: "%s | DIVU Analytics",
  },
  description: "Secure-by-design industrial analytics platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var e=document.documentElement,t=localStorage.getItem('divu-theme'),d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;e.classList.toggle('dark',d);e.classList.toggle('reduce-motion',localStorage.getItem('divu-reduced-motion')==='true');e.classList.toggle('increase-contrast',localStorage.getItem('divu-increased-contrast')==='true');e.classList.toggle('large-interface-text',localStorage.getItem('divu-large-text')==='true');e.lang=localStorage.getItem('divu-language')||'en'}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
