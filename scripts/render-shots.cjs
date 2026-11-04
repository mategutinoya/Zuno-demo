// Renders the Experience imagery from the in-site 3D studio (/studio).
// Usage: start the app (npm run dev or npm start) then `npm run render:shots`.
const { chromium } = require("playwright");
const { mkdir, writeFile } = require("node:fs/promises");

const BASE = process.env.STUDIO_URL ?? "http://localhost:3000";
const SHOTS = {
  "moment-fresh-cut": [700, 1608],
  "moment-golden-hour": [700, 1608],
  "moment-bright-side": [700, 1608],
  "moment-night-mood": [700, 1608],
  "golden-hour": [1800, 1500],
  "fresh-cut": [1800, 1500],
  "ice-cold": [1800, 1500],
  lineup: [1800, 1500],
  story: [1200, 1500],
};
const only = process.argv.slice(2);

(async () => {
await mkdir("public/experience", { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const [id, [w, h]] of Object.entries(SHOTS)) {
  if (only.length && !only.includes(id)) continue;
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on("pageerror", (e) => console.error(id, e.message));
  await page.goto(`${BASE}/studio?shot=${id}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__studioReady === true, null, { timeout: 240000 });
  const data = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/jpeg", 0.9));
  await writeFile(`public/experience/${id}.jpg`, Buffer.from(data.split(",")[1], "base64"));
  console.log("rendered", id);
  await page.close();
}
await browser.close();
})();
