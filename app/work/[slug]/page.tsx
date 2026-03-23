import { projects } from "@/data/projects";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Project detail */}
    </main>
  );
}
