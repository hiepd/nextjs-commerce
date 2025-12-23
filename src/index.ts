import { Container, getContainer, getRandom } from "@cloudflare/containers";

export class CommerceContainer extends Container<Env> {
	// Port the Next.js server listens on
	defaultPort = 3000;

	// Time before container sleeps due to inactivity
	sleepAfter = "10m";

	// Environment variables passed to the container
	envVars = {
		NODE_ENV: "production",
	};

	override onStart() {
		console.log("Container successfully started");
	}

	override onStop() {
		console.log("Container successfully shut down");
	}

	override onError(error: unknown) {
		console.log("Container error:", error);
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Info route
		if (url.pathname === "/") {
			return new Response(
				"Available endpoints:\n" +
					"GET /app - Route to the Next.js commerce app\n" +
					"GET /lb - Load balance across multiple container instances\n" +
					"GET /singleton - Get a single container instance"
			);
		}

		// Route to app container by path
		if (url.pathname.startsWith("/app")) {
			const container = getContainer(env.COMMERCE_CONTAINER, "app");
			return await container.fetch(request);
		}

		// Load balance across multiple containers
		if (url.pathname === "/lb") {
			const container = await getRandom(env.COMMERCE_CONTAINER, 3);
			return await container.fetch(request);
		}

		// Singleton pattern
		if (url.pathname === "/singleton") {
			const container = getContainer(env.COMMERCE_CONTAINER);
			return await container.fetch(request);
		}

		// Default: route all traffic to singleton container
		const container = getContainer(env.COMMERCE_CONTAINER);
		return await container.fetch(request);
	},
};

