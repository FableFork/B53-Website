"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [covering, setCovering]   = useState(false);
  const router                    = useRouter();
  const pathname                  = usePathname();
  const prevPathname              = useRef(pathname);

  // Once the new pathname lands, fade the overlay out
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setTimeout(() => setCovering(false), 80);
    }
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      setCovering(true);
      setTimeout(() => router.push(href), 420); // wait for overlay to cover first
    },
    [pathname, router]
  );

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}

      {/* Full-page cover — sits above everything including nav */}
      <AnimatePresence>
        {covering && (
          <motion.div
            key="page-cover"
            className="fixed inset-0 bg-[#0a0a0a] pointer-events-none"
            style={{ zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

export const usePageTransition = () => useContext(TransitionContext);
