/**
 * Container Application Server
 * 
 * This is the application that runs inside the container.
 * It's a simple HTTP server that handles requests forwarded from the Worker.
 * 
 * You can replace this with any application (Python, Go, Rust, etc.)
 * that listens on port 8080.
 */

const PORT = 8080;

const server = Bun.serve({
  port: PORT,
  fetch(request: Request): Response | Promise<Response> {
    const url = new URL(request.url);
    
    console.log(`[Container] ${request.method} ${url.pathname}`);
    
    // Route handlers
    if (url.pathname === "/health") {
      return handleHealth();
    }
    
    if (url.pathname === "/process-image" && request.method === "POST") {
      return handleImageProcessing(request);
    }
    
    if (url.pathname === "/generate-pdf" && request.method === "POST") {
      return handlePdfGeneration(request);
    }
    
    if (url.pathname === "/heavy-computation" && request.method === "POST") {
      return handleHeavyComputation(request);
    }
    
    // Default response
    return new Response(
      JSON.stringify({
        message: "Commerce Container API",
        version: "1.0.0",
        endpoints: [
          { path: "/health", method: "GET", description: "Health check" },
          { path: "/process-image", method: "POST", description: "Process and optimize images" },
          { path: "/generate-pdf", method: "POST", description: "Generate PDF documents" },
          { path: "/heavy-computation", method: "POST", description: "Run resource-intensive computations" },
        ],
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  },
});

console.log(`Container server running on port ${PORT}`);

// Handler functions

function handleHealth(): Response {
  return new Response(
    JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}

async function handleImageProcessing(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { imageUrl?: string; operations?: string[] };
    
    // Placeholder for image processing logic
    // In a real implementation, you would:
    // - Fetch the image from the URL
    // - Apply transformations (resize, compress, format conversion)
    // - Return the processed image or a URL to it
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Image processing completed",
        input: body,
        result: {
          processedAt: new Date().toISOString(),
          operations: body.operations || ["optimize"],
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to process image" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function handlePdfGeneration(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { template?: string; data?: Record<string, unknown> };
    
    // Placeholder for PDF generation logic
    // In a real implementation, you would:
    // - Use a library like puppeteer, pdfkit, or jspdf
    // - Generate the PDF from a template with the provided data
    // - Return the PDF or a URL to it
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "PDF generation completed",
        result: {
          generatedAt: new Date().toISOString(),
          template: body.template || "default",
          pageCount: 1,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function handleHeavyComputation(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { task?: string; params?: Record<string, unknown> };
    
    // Placeholder for heavy computation logic
    // This is where you'd run CPU-intensive tasks that can't run in Workers
    
    const startTime = Date.now();
    
    // Simulate some computation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i);
    }
    
    const duration = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Computation completed",
        result: {
          completedAt: new Date().toISOString(),
          durationMs: duration,
          task: body.task || "default",
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to complete computation" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

