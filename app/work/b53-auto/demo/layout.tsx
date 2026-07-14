import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/work/b53-auto/demo" },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
