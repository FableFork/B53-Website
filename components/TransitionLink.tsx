"use client";

import { usePageTransition } from "@/context/TransitionContext";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function TransitionLink({ href, children, className, style, onClick }: Props) {
  const { navigate } = usePageTransition();

  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
