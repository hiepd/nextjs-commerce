import { Container, getContainer } from "@cloudflare/containers";

/**
 * CommerceContainer - A container for handling resource-intensive tasks
 * 
 * Use cases for e-commerce:
 * - Image processing and optimization
 * - PDF generation (invoices, receipts)
 * - Heavy data processing
 * - AI/ML inference tasks
 */
export class CommerceContainer extends Container {
  // Port the container application listens on
  defaultPort = 8080;
  
  // Stop the container instance after 10 minutes of inactivity
  sleepAfter = "10m";
  
  // Memory allocation for the container (in MB)
  // Adjust based on your workload requirements
  maxMemory = 512;
}

export interface Env {
  COMMERCE_CONTAINER: DurableObjectNamespace<CommerceContainer>;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Route container requests to /api/container/*
    if (url.pathname.startsWith("/api/container")) {
      return handleContainerRequest(request, env, url);
    }
    
    // For all other requests, pass through to the main Next.js app
    // This allows the container worker to coexist with OpenNext
    return env.ASSETS.fetch(request);
  },
};

async function handleContainerRequest(
  request: Request, 
  env: Env, 
  url: URL
): Promise<Response> {
  // Extract session/task ID from query params or headers
  // This determines which container instance handles the request
  const sessionId = url.searchParams.get("session") || 
                    request.headers.get("x-session-id") || 
                    "default";
  
  try {
    // Get or create a container instance for this session
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

