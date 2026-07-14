"use client";

// Page transition — column shutter.
// 5 vertical panels wipe down with a stagger, cover the page during route
// change, then wipe up on arrival. Mono readout bottom-left.

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

const PANELS = 5;
const EASE = [0.76, 0, 0.24, 1] as const;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [covering, setCovering] = useState(false);
  const [target, setTarget]     = useState("");
  const router                  = useRouter();
  const pathname                = usePathname();
  const prevPathname            = useRef(pathname);

  // Once the new pathname lands, lift the shutter
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setTimeout(() => setCovering(false), 120);
    }
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      setTarget(href.toUpperCase());
      setCovering(true);
      setTimeout(() => router.push(href), 480); // panels fully closed first
    },
    [pathname, router]
  );

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}

      <AnimatePresence>
        {covering && (
          <div className="fixed inset-0 pointer-events-none flex" style={{ zIndex: 9999 }}>
            {Array.from({ length: PANELS }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-[#0a0a0a] border-r border-white/[0.06] last:border-r-0"
                initial={{ y: "-100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
              />
            ))}
            <motion.span
              className="mono-label text-muted absolute bottom-6 left-5 md:left-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              LOADING {target}
            </motion.span>
          </div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

export const usePageTransition = () => useContext(TransitionContext);
