import { Container, getContainer, getRandom } from "@cloudflare/containers";

/**
 * CommerceContainer - Cloudflare Container class for running the Next.js commerce app
 *
 * This container runs the Next.js standalone server and handles all commerce
 * traffic through Cloudflare's container infrastructure.
 */
export class CommerceContainer extends Container<CloudflareEnv> {
	// Port the Next.js server listens on
	defaultPort = 3000;

	// Time before container sleeps due to inactivity (10 minutes for commerce)
	sleepAfter = "10m";

	// Environment variables passed to the container
	envVars = {
		NODE_ENV: "production",
		NEXT_TELEMETRY_DISABLED: "1",
	};

	// Optional lifecycle hooks
	override onStart() {
		console.log("Commerce container successfully started");
	}

	override onStop() {
		console.log("Commerce container successfully shut down");
	}

	override onError(error: unknown) {
		console.log("Commerce container error:", error);
	}
}

/**
 * Helper functions for container access patterns
 */

/**
 * Get a singleton container instance (default pattern for most requests)
 */
export function getCommerceContainer(env: CloudflareEnv) {
	return getContainer(env.COMMERCE_CONTAINER);
}

/**
 * Get a container by specific ID (useful for session affinity)
 */
export function getCommerceContainerById(env: CloudflareEnv, id: string) {
	const containerId = env.COMMERCE_CONTAINER.idFromName(id);
	return env.COMMERCE_CONTAINER.get(containerId);
}

/**
 * Load balance across multiple container instances
 */
export async function getRandomCommerceContainer(
	env: CloudflareEnv,
	maxInstances: number = 5
) {
	return getRandom(env.COMMERCE_CONTAINER, maxInstances);
}

