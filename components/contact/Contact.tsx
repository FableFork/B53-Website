"use client";

// Contact — numbered form sheet, centered. Same /api/contact endpoint.

import { useState } from "react";
import SectionRule from "@/components/ui/SectionRule";
import { site } from "@/data/site";

type Status = "idle" | "loading" | "success" | "error";

function Field({
  index,
  label,
  optional,
  children,
}: {
  index: string;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 group/field">
      <label className="mono-label text-muted">
        <b className="font-normal mr-2.5 group-focus-within/field:text-brand transition-colors">{index}</b>
        {label}
        {optional && <span className="ml-2">— OPTIONAL</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-transparent border-b border-hairline pb-3 font-geist text-[#f0f0f0] placeholder-muted/50 outline-none focus:border-brand transition-colors duration-300";

export default function Contact({
  sectionIndex = "04",
  ruleTitle = "Contact",
  hideRule,
}: {
  sectionIndex?: string;
  ruleTitle?: string;
  hideRule?: boolean;
}) {
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [company,     setCompany]     = useState("");
  const [description, setDescription] = useState("");
  const [status,      setStatus]      = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, description }),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
      setName(""); setEmail(""); setCompany(""); setDescription("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="relative z-[2] bg-[#0a0a0a] px-5 md:px-10 py-16 md:py-24">
      {!hideRule && (
        <SectionRule index={sectionIndex} title={ruleTitle} meta={site.contact.responseLine} />
      )}

      {/* Centered form sheet */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Field index="01" label="Name">
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className={inputClass}
              style={{ fontSize: "0.95rem" }}
            />
          </Field>

          <Field index="02" label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={inputClass}
              style={{ fontSize: "0.95rem" }}
            />
          </Field>
        </div>

        <Field index="03" label="Company" optional>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Where do you work?"
            className={inputClass}
            style={{ fontSize: "0.95rem" }}
          />
        </Field>

        <Field index="04" label="Brief">
          <textarea
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell me about your project..."
            className={`${inputClass} resize-none`}
            style={{ fontSize: "0.95rem" }}
          />
        </Field>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full h-[3.2rem] bg-brand border border-brand text-black mono-label tracking-[0.25em] hover:bg-[#f0f0f0] hover:border-[#f0f0f0] transition-colors disabled:opacity-50"
          >
            {status === "loading"
              ? "SENDING…"
              : status === "success"
              ? "SENT — RESPONSE WITHIN 48H"
              : "TRANSMIT →"}
          </button>

          {status === "error" && (
            <p className="mono-label text-brand">ERROR — RETRY</p>
          )}
        </div>
      </form>
    </section>
  );
}
