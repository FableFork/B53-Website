"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Status = "idle" | "loading" | "success" | "error";

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-geist text-[#888880] uppercase tracking-widest" style={{ fontSize: "0.6rem" }}>
        {label}
        {optional && <span className="ml-1 normal-case tracking-normal" style={{ fontSize: "0.6rem" }}>(optional)</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-transparent border-b border-white/15 pb-3 font-geist text-[#f0f0f0] placeholder-[#888880]/50 outline-none focus:border-[#fa3d00] transition-colors duration-300";

export default function Contact() {
  const sectionRef  = useRef<HTMLElement>(null);
  const inView      = useInView(sectionRef, { once: true, margin: "-60px" });

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
    <section
      ref={sectionRef}
      className="bg-[#0a0a0a] px-6 md:px-16 lg:px-24 py-24 md:py-32"
    >
      <div className="max-w-2xl mx-auto">

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="font-niagara text-[#f0f0f0] uppercase text-center mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.05em" }}
        >
          Get in Touch
        </motion.h2>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col gap-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Field label="Name">
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

            <Field label="Email">
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

          <Field label="Company" optional>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Where do you work?"
              className={inputClass}
              style={{ fontSize: "0.95rem" }}
            />
          </Field>

          <Field label="Description">
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

          {/* Submit */}
          <div className="flex flex-col items-stretch gap-3">
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="relative overflow-hidden rounded-full border border-white/30 font-geist tracking-[0.2em] uppercase transition-colors disabled:opacity-50 group"
              style={{ fontSize: "0.65rem", height: "3rem", width: "100%" }}
            >
              {/* Hover fill */}
              <span className="absolute inset-0 rounded-full bg-[#f0f0f0] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
              <span
                className="relative z-10 select-none"
                style={{ color: "#f0f0f0", mixBlendMode: "difference" }}
              >
                {status === "loading" ? "Sending..." : status === "success" ? "Sent ✓" : "Send Message"}
              </span>
            </button>

            {status === "error" && (
              <p className="font-geist text-[#fa3d00]" style={{ fontSize: "0.75rem" }}>
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
}
