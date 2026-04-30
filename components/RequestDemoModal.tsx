"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full bg-transparent border-b border-white/15 pb-3 font-geist text-[#f0f0f0] placeholder-[#888880]/50 outline-none focus:border-[#fa3d00] transition-colors duration-300";

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

export default function RequestDemoModal({ subject }: { subject: string }) {
  const [open,    setOpen]    = useState(false);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [company, setCompany] = useState("");
  const [status,  setStatus]  = useState<Status>("idle");

  function close() {
    if (status === "loading") return;
    setOpen(false);
    setStatus("idle");
    setName(""); setEmail(""); setCompany("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, description: subject }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative overflow-hidden flex items-center justify-center w-full group"
        style={{ height: "3.5rem", background: "#fa3d00", border: "1px solid #fa3d00", cursor: "pointer" }}
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out bg-white" />
        <span className="relative font-geist uppercase tracking-widest z-10" style={{ fontSize: "0.65rem", color: "#000" }}>
          Request a Demo
        </span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 400, background: "rgba(0,0,0,0.85)" }}
          onClick={close}
        >
          {/* Modal box */}
          <div
            className="relative w-full mx-4 flex flex-col gap-8 px-8 py-10"
            style={{ maxWidth: "32rem", background: "#0a0a0a", border: "1px solid rgba(240,240,240,0.15)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-5 font-geist text-[#888880] hover:text-[#f0f0f0] transition-colors"
              style={{ fontSize: "1.1rem", lineHeight: 1 }}
            >
              ×
            </button>

            {/* Header */}
            <div>
              <p className="font-geist text-[#888880] uppercase tracking-widest mb-3" style={{ fontSize: "0.6rem" }}>
                Request
              </p>
              <div className="w-4 h-px bg-white/20 mb-3" />
              <h2 className="font-niagara text-[#f0f0f0] uppercase" style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)" }}>
                Book a Demo
              </h2>
            </div>

            {status === "success" ? (
              <div className="flex flex-col gap-3">
                <p className="font-geist text-[#f0f0f0]" style={{ fontSize: "0.95rem" }}>
                  Request sent. We&rsquo;ll be in touch shortly.
                </p>
                <button
                  onClick={close}
                  className="font-geist text-[#888880] hover:text-[#f0f0f0] transition-colors text-left uppercase tracking-widest"
                  style={{ fontSize: "0.6rem" }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                <Field label="Enquiry">
                  <input
                    type="text"
                    readOnly
                    value={subject}
                    className={`${inputClass} opacity-60 cursor-default`}
                    style={{ fontSize: "0.95rem" }}
                  />
                </Field>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="relative overflow-hidden border border-[#fa3d00] font-geist tracking-widest uppercase disabled:opacity-50 group w-full"
                    style={{ fontSize: "0.6rem", height: "3rem", backgroundColor: "#fa3d00" }}
                  >
                    <span className="absolute inset-0 bg-[#f0f0f0] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                    <span className="relative z-10 select-none" style={{ color: "#000" }}>
                      {status === "loading" ? "Sending..." : "Send Request"}
                    </span>
                  </button>

                  {status === "error" && (
                    <p className="font-geist text-[#fa3d00]" style={{ fontSize: "0.75rem" }}>
                      Something went wrong. Please try again.
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
