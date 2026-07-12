import fs from "fs";
import { execSync } from "child_process";

console.log("Starting build...");
execSync("npx vite build", { stdio: "inherit" });

console.log("Constructing Vercel Build Output API...");
fs.mkdirSync(".vercel/output/static", { recursive: true });
fs.mkdirSync(".vercel/output/functions/index.func", { recursive: true });

fs.cpSync("dist/client", ".vercel/output/static", { recursive: true });
fs.cpSync("dist/server", ".vercel/output/functions/index.func/dist/server", { recursive: true });

fs.writeFileSync(
  ".vercel/output/functions/index.func/index.js",
  `
import server from './dist/server/server.js';
export default async function handler(request) {
  return server.fetch(request, {}, {});
}
`,
);

fs.writeFileSync(
  ".vercel/output/functions/index.func/.vc-config.json",
  JSON.stringify({
    runtime: "edge",
    entrypoint: "index.js",
  }),
);

fs.writeFileSync(
  ".vercel/output/config.json",
  JSON.stringify({
    version: 3,
    routes: [{ handle: "filesystem" }, { src: "/(.*)", dest: "/" }],
  }),
);

console.log("Vercel output constructed successfully.");
