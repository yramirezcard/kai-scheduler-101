import { type ReactNode, isValidElement } from "react";
import { CodeBlockClient } from "./CodeBlockClient";

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) return extractText((node.props as { children?: ReactNode }).children);
  return "";
}

function getLang(node: ReactNode): string {
  if (Array.isArray(node)) {
    for (const c of node) {
      const l = getLang(c);
      if (l) return l;
    }
    return "";
  }
  if (isValidElement(node)) {
    const cn = String((node.props as { className?: string }).className || "");
    const m = /language-([\w-]+)/.exec(cn);
    if (m) return m[1];
    return getLang((node.props as { children?: ReactNode }).children);
  }
  return "";
}

// MDX renders fenced code as <pre><code className="language-*">...</code></pre>.
// Extract that server-side and pass plain serializable props to the interactive client toolbar.
export function CodeBlock({ children }: { children?: ReactNode }) {
  return <CodeBlockClient code={extractText(children).replace(/\n$/, "")} lang={getLang(children)} />;
}
