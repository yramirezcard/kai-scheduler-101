"use client";

import { useEffect, useState } from "react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";
import json from "highlight.js/lib/languages/json";
// Token colors come from theme-adaptive CSS in globals.css (.hljs-*), not a fixed hljs theme.
import { runInShell } from "@/lib/labBus";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("json", json);

const SHELL_LANGS = ["bash", "sh", "shell", "console", "zsh"];
// Reference fences: highlighted like bash but NEVER runnable (commands we show but don't want run).
const REF_LANGS = ["bash-ref", "sh-ref", "ref"];

function hljsLang(lang: string): string | null {
  if (lang === "" || SHELL_LANGS.includes(lang) || REF_LANGS.includes(lang)) return "bash";
  if (lang === "yaml" || lang === "yml") return "yaml";
  if (lang === "json") return "json";
  return null;
}

// Syntax-highlighted code with a Copy toolbar, plus a "Run in shell" button on shell blocks
// that contain at least one real command.
export function CodeBlockClient({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const isRef = REF_LANGS.includes(lang);
  const isShell = lang === "" || SHELL_LANGS.includes(lang);
  const hasCommand = code.split("\n").some((l) => l.trim() !== "" && !/^\s*#/.test(l));
  const runnable = isShell && hasCommand && !isRef;
  const label = isRef ? "reference" : (lang || "shell");

  const grammar = hljsLang(lang);
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    if (!grammar) {
      setHtml(null);
      return;
    }
    try {
      setHtml(hljs.highlight(code, { language: grammar }).value);
    } catch {
      setHtml(null);
    }
  }, [code, grammar]);

  const dotColor = isRef ? "#94a3b8" : isShell ? "#2dd4bf" : grammar === "yaml" ? "#f59e0b" : grammar === "json" ? "#a78bfa" : "#64748b";

  return (
    <div className="group relative my-5 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-code-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] px-3 py-1.5">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-fg-mut)]">
          <span style={{ width: 7, height: 7, borderRadius: 7, background: dotColor, display: "inline-block" }} />
          {label}
        </span>
        <div className="flex gap-2">
          {runnable && (
            <button
              onClick={() => runInShell(code)}
              className="rounded border border-[var(--color-kai-dim)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-kai-bright)] hover:bg-[var(--color-panel)]"
              title="Run this in the lab shell"
            >
              ▶ Run in shell
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }}
            className="rounded border border-[var(--color-line-2)] px-2 py-0.5 text-[11px] text-[var(--color-fg-mut)] hover:text-[var(--color-fg)]"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed">
        {html ? (
          <code
            className={`hljs language-${grammar}`}
            style={{ background: "transparent", padding: 0 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <code className="text-[var(--color-code-fg)]">{code}</code>
        )}
      </pre>
    </div>
  );
}
