import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const workerEntrypoint = fileURLToPath(
  new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url),
);
const appShellPath = fileURLToPath(
  new URL("../excalidraw-app/build/index.html", import.meta.url),
);

assert.ok(
  existsSync(appShellPath),
  "Build excalidraw-app with VITE_APP_BASE_PATH=/whiteboard/ before this runtime test",
);

const portServer = createServer();
await new Promise((resolve, reject) => {
  portServer.once("error", reject);
  portServer.listen(0, "127.0.0.1", resolve);
});
const { port } = portServer.address();
await new Promise((resolve, reject) => {
  portServer.close((error) => (error ? reject(error) : resolve()));
});

const worker = spawn(
  process.execPath,
  [
    workerEntrypoint,
    "dev",
    "--local",
    "--ip",
    "127.0.0.1",
    "--port",
    `${port}`,
  ],
  { cwd: projectRoot, stdio: ["ignore", "pipe", "pipe"] },
);
let workerOutput = "";
worker.stdout.setEncoding("utf8").on("data", (chunk) => {
  workerOutput = `${workerOutput}${chunk}`.slice(-20_000);
});
worker.stderr.setEncoding("utf8").on("data", (chunk) => {
  workerOutput = `${workerOutput}${chunk}`.slice(-20_000);
});

const baseUrl = `http://127.0.0.1:${port}`;
const waitForWorker = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (worker.exitCode !== null) {
      throw new Error(
        `Wrangler exited before becoming ready:\n${workerOutput}`,
      );
    }
    try {
      const response = await fetch(`${baseUrl}/whiteboard/health`);
      if (response.status === 200) {
        return;
      }
    } catch {
      await delay(100);
    }
  }
  throw new Error(`Wrangler did not become ready:\n${workerOutput}`);
};

try {
  await waitForWorker();

  const nestedUrl = `${baseUrl}/whiteboard/room/runtime-regression`;
  const nestedResponse = await fetch(nestedUrl, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "sec-fetch-mode": "navigate",
      "sec-fetch-dest": "document",
    },
    redirect: "manual",
  });
  const nestedHtml = await nestedResponse.text();
  assert.equal(
    nestedResponse.status,
    200,
    `nested navigation returns the app shell, received ${
      nestedResponse.status
    } ${nestedResponse.headers.get("location")}`,
  );
  assert.equal(nestedResponse.url, nestedUrl, "nested URL is not redirected");
  assert.match(nestedResponse.headers.get("content-type") ?? "", /text\/html/);
  assert.match(nestedHtml, /<div id="root"><\/div>/);
  assert.match(nestedHtml, /\/whiteboard\/assets\//);

  const missingScript = await fetch(
    `${baseUrl}/whiteboard/assets/__missing-runtime-regression__.js`,
    { headers: { accept: "*/*" } },
  );
  assert.equal(missingScript.status, 404, "missing JavaScript remains a 404");

  const headResponse = await fetch(nestedUrl, {
    method: "HEAD",
    headers: { accept: "text/html" },
    redirect: "manual",
  });
  assert.equal(headResponse.status, 404, "HEAD does not receive the app shell");

  const postResponse = await fetch(nestedUrl, {
    method: "POST",
    headers: { accept: "text/html" },
    redirect: "manual",
  });
  assert.equal(
    postResponse.status,
    404,
    "non-GET does not receive the app shell",
  );

  process.stdout.write(
    "Wrangler runtime checks passed: nested shell at nested URL, missing JS 404, HEAD and POST unchanged.\n",
  );
} catch (error) {
  if (workerOutput) {
    process.stderr.write(`${workerOutput}\n`);
  }
  throw error;
} finally {
  await new Promise((resolve) => {
    const shutdownTimeout = setTimeout(() => {
      worker.kill("SIGKILL");
      resolve();
    }, 3_000);
    worker.once("exit", () => {
      clearTimeout(shutdownTimeout);
      resolve();
    });
    worker.kill("SIGTERM");
  });
}
