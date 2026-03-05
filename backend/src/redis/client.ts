import { createClient } from "redis";

// Connect to the default local Redis port
export const redis = createClient({
  url: "redis://localhost:6379"
});

redis.on("error", (err) => console.error("Redis Client Error", err));

// Auto-connect as a convenience, though in production you might want 
// to manage this lifecycle at the application entrypoint.
redis.connect().catch(console.error);
