"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const NavLinks = [
  { label: "Setup", href: "/interview/setup" },
  { label: "Interview", href: "/interview/session" },
  { label: "Debrief", href: "/interview/debrief" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session;

  // Transparent at the top of the page, solidifies once scrolled past the
  // hero — matches the floating-nav pattern from the reference site.
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

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl z-50">
      <div
        className={
          "flex py-2 px-4 justify-between items-center rounded-xl gap-4 transition-all duration-300 " +
          (scrolled
            ? "border border-gray-700 bg-onyx-light shadow-lg"
            : "border border-transparent bg-transparent")
        }
      >
        <a
          href={isAuthenticated ? "/interview/setup" : "/"}
          className="flex items-center gap-1.5 text-xl font-bold shrink-0 text-white"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-spring animate-pulse shadow-xl shadow-spring-deep" />
          <span>Speculo</span>
        </a>

        <div className="hidden md:flex gap-1">
          {isAuthenticated &&
            NavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2 rounded-xl text-gray-300 text-sm hover:bg-spring-pale hover:text-white transition-colors duration-150 tracking-wide"
              >
                {link.label.toUpperCase()}
              </a>
            ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isPending ? (
            <div className="w-24 h-8 rounded-lg bg-gray-800 animate-pulse" />
          ) : isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 hidden sm:flex bg-gray-800 text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-150"
            >
              Log out
            </button>
          ) : (
            <>
              <a
                href="/auth/sign-in"
                className="px-4 py-2 hidden sm:flex text-gray-300 text-sm font-semibold rounded-lg hover:text-white transition-colors duration-150"
              >
                Log in
              </a>
              <a
                href="/auth/sign-up"
                className="px-4 py-2 hidden sm:flex bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150"
              >
                Sign up
              </a>
            </>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 flex flex-col border border-gray-700 bg-onyx-light rounded-xl overflow-hidden z-50 shadow-xl">
          {isAuthenticated ? (
            <>
              {NavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-sm text-gray-400 tracking-wide hover:bg-spring-pale hover:text-white border-b border-gray-700/50 transition-colors duration-150"
                >
                  {link.label.toUpperCase()}
                </a>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="px-5 py-3.5 text-sm text-gray-400 tracking-wide hover:bg-spring-pale hover:text-white text-left transition-colors duration-150"
              >
                LOG OUT
              </button>
            </>
          ) : (
            <>
              <a
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="px-5 py-3.5 text-sm text-gray-400 tracking-wide hover:bg-spring-pale hover:text-white border-b border-gray-700/50 transition-colors duration-150"
              >
                LOG IN
              </a>
              <a
                href="/auth/sign-up"
                onClick={() => setMenuOpen(false)}
                className="px-5 py-3.5 text-sm text-gray-400 tracking-wide hover:bg-spring-pale hover:text-white transition-colors duration-150"
              >
                SIGN UP
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}