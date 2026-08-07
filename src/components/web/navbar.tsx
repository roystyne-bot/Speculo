"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import Image from "next/image";


export default function Navbar() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session;

  const APP_LINKS = [
    { label: t("Navbar.setup"), href: "/interview/setup" },
    { label: t("Navbar.interview"), href: "/interview/session" },
    { label: t("Navbar.dashboard"), href: "/dashboard" },
  ];
  const MARKETING_LINKS = [
    { label: t("Navbar.roles"), href: "#roles" },
    { label: t("Navbar.faq"), href: "#faq" },
    { label: t("Navbar.pricing"), href: "/pricing" },
    { label: t("Navbar.blog"), href: "/blog" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  function handleClickOut(){
    setMenuOpen(false);
  }
  //Wanna close the nav when clicking anywhere except nav itself
  //document.body.addEventListener('click', handleClickOut);

  const links = isAuthenticated ? APP_LINKS : MARKETING_LINKS;
 
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl z-50">
      <div
        className={
          "flex py-2 px-4 justify-between items-center rounded-xl gap-4 transition-all duration-300 " +
          (scrolled
            ? "border border-border bg-card shadow-lg"
            : "border border-transparent bg-transparent")
        }
      >
        <a
          href={isAuthenticated ? "/interview/setup" : "/"}
          className="flex items-center text-xl font-bold shrink-0 text-foreground"
        >
          <Image
          src="/icon.svg"
          alt="Speculo's Logo"
          width={35}
          height={35}
          className="mr-1"
          />
          <div className={`${scrolled ? "hidden" : "visible"}`}>
          <span className="font-serif text-3xl text-spring">S</span>
          peculo
          </div>
          <span className={`border-r-2 ml-3 w-[0.5px] h-[25px] border-foreground ${scrolled ? "visible" : "hidden"}`}>
        </span>
        </a>

        

        <div className="hidden md:flex gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-xl text-foreground/70 text-sm hover:bg-spring-pale hover:text-spring-deep transition-colors duration-150 tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LocaleSwitcher />
          <ThemeToggle />

          {isPending ? (
            <div className="w-24 h-8 rounded-lg bg-secondary animate-pulse" />
          ) : isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 hidden text-red-500 sm:flex bg-secondary text-sm font-semibold rounded-lg hover:bg-secondary/70 transition-colors duration-150"
            >
              {t("Navbar.logOut")}
            </button>
          ) : (
            <>
              <a
                href="/auth/login"
                className="px-4 py-2 hidden sm:flex text-foreground/70 text-sm font-semibold rounded-lg hover:text-foreground transition-colors duration-150"
              >
                {t("Navbar.logIn")}
              </a>
              <a
                href="/auth/sign-up"
                className="px-4 py-2 hidden sm:flex bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150"
              >
                {t("Navbar.signUp")}
              </a>
            </>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground/70 hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 flex flex-col border border-border bg-card rounded-xl overflow-hidden z-50 shadow-xl">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-5 py-3.5 text-sm text-muted-foreground tracking-wide hover:bg-spring-pale hover:text-spring-deep border-b border-border transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="px-5 py-3.5 text-sm text-red-500 tracking-wide hover:bg-spring-pale hover:text-spring-deep text-left transition-colors duration-150"
            >
              {t("Navbar.logOut")}
            </button>
          ) : (
            <>
              <a
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="px-5 py-3.5 text-sm text-muted-foreground tracking-wide hover:bg-spring-pale hover:text-spring-deep border-b border-border transition-colors duration-150"
              >
                {t("Navbar.logIn")}
              </a>
              <a
                href="/auth/sign-up"
                onClick={() => setMenuOpen(false)}
                className="px-5 py-3.5 text-sm text-muted-foreground tracking-wide hover:bg-spring-pale hover:text-spring-deep transition-colors duration-150"
              >
                {t("Navbar.signUp")}
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}