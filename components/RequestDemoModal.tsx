"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full bg-transparent border-b border-hairline pb-3 font-geist text-[#f0f0f0] placeholder-muted/50 outline-none focus:border-brand transition-colors duration-300";

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
    <div className="flex flex-col gap-2 group/field">
      <label className="mono-label text-muted">
        <b className="font-normal mr-2.5 group-focus-within/field:text-brand transition-colors">{index}</b>
        {label}
        {optional && <span className="ml-2">— OPTIONAL</span>}
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
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden flex items-center justify-center w-full h-14 bg-brand border border-brand cursor-pointer"
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out bg-[#f0f0f0]" />
        <span className="relative mono-label z-10 text-black">Request a Demo</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 400, background: "rgba(0,0,0,0.85)" }}
          onClick={close}
        >
          <div
            className="relative w-full mx-4 flex flex-col gap-8 px-8 py-10 max-w-lg bg-[#0a0a0a] border border-hairline"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-4 right-5 font-mono text-muted hover:text-[#f0f0f0] transition-colors text-lg leading-none"
            >
              ×
            </button>

            {/* Header */}
            <div>
              <p className="mono-label text-muted mb-3">Request</p>
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
                <button onClick={close} className="mono-label text-muted hover:text-[#f0f0f0] transition-colors text-left">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                <Field index="04" label="Enquiry">
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
                    className="w-full h-12 bg-brand border border-brand text-black mono-label tracking-[0.25em] hover:bg-[#f0f0f0] hover:border-[#f0f0f0] transition-colors disabled:opacity-50"
                  >
                    {status === "loading" ? "SENDING…" : "SEND REQUEST →"}
                  </button>

                  {status === "error" && (
                    <p className="mono-label text-brand">ERROR — RETRY</p>
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
