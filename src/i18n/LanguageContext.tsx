import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations, defaultLang, languages } from "./translations";
export { languages };  // re-export for components that need the list

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("sharapat_lang") as Lang | null;
    return saved && languages.find((l) => l.code === saved) ? saved : defaultLang;
  });

  useEffect(() => {
    localStorage.setItem("sharapat_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang: Lang) => {
    if (languages.find((l) => l.code === newLang)) setLangState(newLang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let val = translations[lang]?.[key];
    if (!val) val = translations[defaultLang]?.[key];
    if (!val) return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val!.replace(`{${k}}`, String(v));
      });
    }
    return val;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
