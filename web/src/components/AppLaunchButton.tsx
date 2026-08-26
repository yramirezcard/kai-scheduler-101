"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

function buildAppUrl(path: string, port: number) {
  if (typeof window === "undefined") return "#";

  const url = new URL(window.location.href);
  const tunnelMatch = url.hostname.match(/^tunnel-(\d+)-(.+)$/);
  const brevLabMatch = url.hostname.match(/^(.+)\.brevlab\.com$/);

  if (tunnelMatch) {
    const currentTunnel = Number(tunnelMatch[1]);
    const suffix = tunnelMatch[2];
    const currentPort = url.port ? Number(url.port) : 3000;
    const targetTunnel = currentTunnel + (port - currentPort);
    if (targetTunnel > 0) url.hostname = `tunnel-${targetTunnel}-${suffix}`;
    url.port = "";
  } else if (brevLabMatch) {
    const subdomain = brevLabMatch[1];
    const prefixMatch = subdomain.match(/^(?:\d+|ui|kai-lab|kai-scheduler-101-lab)-(.+)$/);
    const suffix = prefixMatch ? prefixMatch[1] : subdomain;

    if (port === 3000) {
      url.hostname = suffix.endsWith(".brevlab.com") ? suffix : `${suffix}.brevlab.com`;
    } else {
      const tunnelPrefix = port === 3001 ? "ui" : String(port);
      url.hostname = `${tunnelPrefix}-${suffix}.brevlab.com`;
    }
    url.port = "";
  } else {
    url.port = String(port);
  }

  url.pathname = path.startsWith("/") ? path : `/${path}`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function AppLaunchButton({ label, path, port = 3000 }: { label: string; path: string; port?: number }) {
  const [href, setHref] = useState("#");

  useEffect(() => {
    setHref(buildAppUrl(path, port));
  }, [path, port]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="my-5 inline-flex items-center gap-2 rounded-lg border border-[var(--color-kai-dim)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-kai-bright)] no-underline transition hover:border-[var(--color-kai)] hover:bg-[var(--color-bg-2)]"
    >
      <ExternalLink size={15} />
      {label}
    </a>
  );
}
