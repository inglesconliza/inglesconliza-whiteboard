import { describe, expect, it } from "vitest";

import worker from "./worker";

type AssetRequest = {
  url: string;
  method: string;
  accept: string | null;
};

const createAssets = (
  respond: (request: Request) => Response | Promise<Response>,
) => {
  const requests: AssetRequest[] = [];

  return {
    requests,
    fetch: async (request: Request) => {
      requests.push({
        url: request.url,
        method: request.method,
        accept: request.headers.get("accept"),
      });
      return respond(request);
    },
  };
};

const fetchWorker = (
  request: Request,
  assets: ReturnType<typeof createAssets>,
) => worker.fetch(request, { ASSETS: assets } as never);

describe("InglesConLiza whiteboard Worker", () => {
  it("redirects the bare base path with its query string", async () => {
    const assets = createAssets(() => new Response("unexpected"));

    const response = await fetchWorker(
      new Request("https://www.inglesconliza.com/whiteboard?room=lesson-1"),
      assets,
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.inglesconliza.com/whiteboard/?room=lesson-1",
    );
    expect(assets.requests).toEqual([]);
  });

  it("returns deployment metadata without fetching an asset", async () => {
    const assets = createAssets(() => new Response("unexpected"));

    const response = await fetchWorker(
      new Request("https://www.inglesconliza.com/whiteboard/health"),
      assets,
    );

    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      service: "inglesconliza-whiteboard",
      status: "ok",
      branch: "unknown",
      commitHash: "unknown",
      deployedAt: "unknown",
    });
    expect(assets.requests).toEqual([]);
  });

  it("does not claim routes outside the whiteboard prefix", async () => {
    const assets = createAssets(() => new Response("unexpected"));

    const response = await fetchWorker(
      new Request("https://www.inglesconliza.com/pricing"),
      assets,
    );

    expect(response.status).toBe(404);
    expect(assets.requests).toEqual([]);
  });

  it("strips the route prefix before fetching an asset", async () => {
    const assets = createAssets(() => new Response("asset"));

    const response = await fetchWorker(
      new Request(
        "https://www.inglesconliza.com/whiteboard/assets/app.js?version=1",
      ),
      assets,
    );

    expect(await response.text()).toBe("asset");
    expect(assets.requests).toEqual([
      {
        url: "https://www.inglesconliza.com/assets/app.js?version=1",
        method: "GET",
        accept: null,
      },
    ]);
  });

  it("falls back to the app shell for an HTML navigation, including nested routes", async () => {
    const assets = createAssets((request) =>
      new URL(request.url).pathname === "/"
        ? new Response("app shell")
        : new Response("missing", { status: 404 }),
    );

    const response = await fetchWorker(
      new Request("https://www.inglesconliza.com/whiteboard/room/lesson-1", {
        headers: { accept: "text/html,application/xhtml+xml" },
      }),
      assets,
    );

    expect(await response.text()).toBe("app shell");
    expect(assets.requests.map(({ url }) => url)).toEqual([
      "https://www.inglesconliza.com/room/lesson-1",
      "https://www.inglesconliza.com/",
    ]);
  });

  it("leaves a missing JavaScript asset as a 404", async () => {
    const assets = createAssets(() => new Response("missing", { status: 404 }));

    const response = await fetchWorker(
      new Request("https://www.inglesconliza.com/whiteboard/assets/missing.js"),
      assets,
    );

    expect(response.status).toBe(404);
    expect(assets.requests).toHaveLength(1);
  });

  it.each(["HEAD", "POST"])(
    "does not use the app shell for a missing %s request",
    async (method) => {
      const assets = createAssets(
        () => new Response("missing", { status: 404 }),
      );

      const response = await fetchWorker(
        new Request("https://www.inglesconliza.com/whiteboard/room/lesson-1", {
          method,
          headers: { accept: "text/html" },
        }),
        assets,
      );

      expect(response.status).toBe(404);
      expect(assets.requests).toHaveLength(1);
    },
  );
});
