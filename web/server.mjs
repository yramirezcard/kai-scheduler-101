// Custom Next.js server that also bridges a browser terminal to a real shell (node-pty) over
// WebSocket. Runs as ONE process on the Brev node, next to the live kind cluster. The shell
// starts with KUBECONFIG pre-pointed at the cluster, so learners run `kubectl ...` for real.
import { createServer, request } from "node:http";
import { parse } from "node:url";
import next from "next";
import { WebSocketServer } from "ws";
import pty from "node-pty";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// Where the lab workspace lives + the kubeconfig phase 20 wrote.
const LAB_CWD = process.env.LAB_CWD || `${process.env.HOME}/kai-scheduler-101-labs`;
const LAB_KUBECONFIG = process.env.LAB_KUBECONFIG || `${LAB_CWD}/kubeconfig`;
const LAB_RC = process.env.LAB_RC || `${process.cwd()}/lab/labrc`;
const MAX_SESSIONS = parseInt(process.env.LAB_MAX_SESSIONS || "25", 10);
const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT || "9090", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
let sessions = 0;
await app.prepare();

function proxyPrometheus(req, res) {
  const originalUrl = req.url || "/prometheus/";
  const targetPath = originalUrl.replace(/^\/prometheus(?=\/|$)/, "") || "/";
  const headers = { ...req.headers, host: `127.0.0.1:${PROMETHEUS_PORT}` };

  const proxyReq = request(
    {
      hostname: "127.0.0.1",
      port: PROMETHEUS_PORT,
      method: req.method,
      path: targetPath,
      headers,
    },
    (proxyRes) => {
      const responseHeaders = { ...proxyRes.headers };
      const location = responseHeaders.location;
      if (typeof location === "string" && location.startsWith("/")) {
        responseHeaders.location = `/prometheus${location}`;
      }
      res.writeHead(proxyRes.statusCode || 502, responseHeaders);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on("error", () => {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(`Prometheus is not reachable on 127.0.0.1:${PROMETHEUS_PORT}. Start the kubectl port-forward command and keep it running.\n`);
  });

  req.pipe(proxyReq);
}

const server = createServer((req, res) => {
  const { pathname } = parse(req.url || "");
  if (pathname === "/prometheus" || pathname?.startsWith("/prometheus/")) {
    proxyPrometheus(req, res);
    return;
  }
  handle(req, res, parse(req.url, true));
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const { pathname } = parse(req.url || "");
  if (pathname !== "/ws/term") { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, (ws) => {
    if (sessions >= MAX_SESSIONS) {
      ws.send("\r\n\x1b[31mToo many active lab sessions. Try again shortly.\x1b[0m\r\n");
      ws.close();
      return;
    }
    sessions++;
    const shell = pty.spawn("/bin/bash", ["--rcfile", LAB_RC, "-i"], {
      name: "xterm-256color",
      cols: 100,
      rows: 28,
      cwd: LAB_CWD,
      env: { ...process.env, KUBECONFIG: LAB_KUBECONFIG, TERM: "xterm-256color", LAB_CWD, KAI101_LAB: "1" },
    });
    const onData = (d) => { if (ws.readyState === ws.OPEN) ws.send(d); };
    shell.onData(onData);
    shell.onExit(() => ws.readyState === ws.OPEN && ws.close());

    ws.isAlive = true;
    ws.on("pong", () => { ws.isAlive = true; });
    const keepalive = setInterval(() => {
      if (ws.readyState !== ws.OPEN) return;
      if (ws.isAlive === false) { try { ws.terminate(); } catch {} return; }
      ws.isAlive = false;
      try { ws.ping(); } catch {}
    }, 20000);

    ws.on("message", (raw) => {
      const msg = raw.toString();
      if (msg.startsWith("\x00resize:")) {
        const [, cols, rows] = msg.split(":");
        try { shell.resize(parseInt(cols, 10) || 100, parseInt(rows, 10) || 28); } catch {}
      } else {
        shell.write(msg);
      }
    });
    ws.on("close", () => { clearInterval(keepalive); try { shell.kill(); } catch {} sessions = Math.max(0, sessions - 1); });
  });
});

server.listen(port, hostname, () => {
  console.log(`> KAI Scheduler 101 workshop ready on http://${hostname}:${port}  (shell bridge: /ws/term)`);
});
