const BASE_PATH = "/whiteboard";

type Env = {
  ASSETS: Fetcher;
  DEPLOY_BRANCH?: string;
  DEPLOY_COMMIT_HASH?: string;
  DEPLOYED_AT?: string;
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

function isHtmlNavigation(request: Request) {
  return request.method === "GET" && (request.headers.get("accept") ?? "").includes("text/html");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === `${BASE_PATH}/health`) {
      return json({
        service: "inglesconliza-whiteboard",
        status: "ok",
        branch: env.DEPLOY_BRANCH ?? "unknown",
        commitHash: env.DEPLOY_COMMIT_HASH ?? "unknown",
        deployedAt: env.DEPLOYED_AT ?? "unknown",
      });
    }

    if (url.pathname === BASE_PATH) {
      url.pathname = `${BASE_PATH}/`;
      return Response.redirect(url.toString(), 308);
    }

    if (!url.pathname.startsWith(`${BASE_PATH}/`)) {
      return new Response("Not found", { status: 404 });
    }

    const assetUrl = new URL(request.url);
    assetUrl.pathname = url.pathname.slice(BASE_PATH.length) || "/";
    let response = await env.ASSETS.fetch(new Request(assetUrl, request));

    if (response.status === 404 && isHtmlNavigation(request)) {
      assetUrl.pathname = "/";
      response = await env.ASSETS.fetch(new Request(assetUrl, request));
    }

    return response;
  },
};
