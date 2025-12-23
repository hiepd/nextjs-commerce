import { getRequestContext } from "@cloudflare/next-on-pages";
import { getContainer } from "@cloudflare/containers";

/**
 * API Route Handler for Container Requests
 * 
 * This route forwards requests to the Cloudflare Container.
 * Access it via: /api/container/{endpoint}
 * 
 * Examples:
 * - GET  /api/container/health
 * - POST /api/container/process-image
 * - POST /api/container/generate-pdf
 * - POST /api/container/heavy-computation
 */

export const runtime = "edge";

async function handleRequest(request: Request): Promise<Response> {
  try {
    const { env } = getRequestContext();
    const url = new URL(request.url);
    
    // Extract session ID from query params or headers for container routing
    const sessionId = url.searchParams.get("session") || 
                      request.headers.get("x-session-id") || 
                      "default";
    
    // Get or create a container instance for this session
    // @ts-expect-error - COMMERCE_CONTAINER is defined in wrangler.jsonc
    const container = getContainer(env.COMMERCE_CONTAINER, sessionId);
    
    // Rewrite the path to remove the /api/container prefix
    const containerPath = url.pathname.replace("/api/container", "") || "/";
    const containerUrl = new URL(containerPath, url.origin);
    containerUrl.search = url.search;
    
    // Create a new request with the rewritten URL
    const containerRequest = new Request(containerUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Forward the request to the container
    return await container.fetch(containerRequest);
  } catch (error) {
    console.error("Container request failed:", error);
    return new Response(
      JSON.stringify({ 
        error: "Container request failed",
        message: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function PUT(request: Request) {
  return handleRequest(request);
}

export async function DELETE(request: Request) {
  return handleRequest(request);
}

