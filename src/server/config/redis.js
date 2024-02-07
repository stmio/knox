import { createClient } from "redis";

const client = createClient();

export async function startRedis() {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  console.log("Initialised redis cache server");
}

export { client as redis };
