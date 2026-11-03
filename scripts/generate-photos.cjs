// Turns the studio renders in /public/experience into photorealistic images
// with OpenAI's image model, keeping the ZUNO bottle and label as reference.
//
// Requires OPENAI_API_KEY in the environment and network access to api.openai.com.
// Usage: npm run photos            (all)
//        npm run photos -- lineup  (only some)
const { readFile, writeFile } = require("node:fs/promises");

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

const STYLE =
  "Photorealistic commercial beverage photography, shot on a full-frame camera with a 85mm lens, " +
  "natural light, real depth of field, subtle film grain, true-to-life glass refraction and condensation droplets. " +
  "Keep the bottle shape, the black crown cap, the liquid colour and the printed label (ZUNO logo, flavour name, " +
  "HARD SELTZER, 4.5% Alc. Vol., 300 ml) exactly as in the reference image. No extra text, no watermark, no people's faces.";

const SHOTS = {
  "golden-hour": {
    size: "1536x1024",
    prompt:
      "A cold ZUNO Mango Passion bottle standing on a weathered wooden beach-bar table at sunset, tropical palms softly out of focus, " +
      "warm golden backlight flaring through the glass, a halved passion fruit and fresh mango cubes beside it, real ice melting.",
  },
  "fresh-cut": {
    size: "1536x1024",
    prompt:
      "A ZUNO Pink Lychee bottle on a pale pink stone surface surrounded by fresh lychees (some peeled, glossy translucent flesh) " +
      "and ripe raspberries, soft daylight from a window, a few water drops on the stone.",
  },
  "ice-cold": {
    size: "1536x1024",
    prompt:
      "Macro close-up of a ZUNO Berry Mood bottle straight from the cooler, heavy condensation and running droplets on the glass, " +
      "dark moody purple background, rim light, fresh blackberries and blueberries with real bloom on a dark slate surface.",
  },
  lineup: {
    size: "1536x1024",
    prompt:
      "The four ZUNO bottles (Pink Lychee, Mango Passion, Achachairú Citrus, Berry Mood) lined up on a white marble bar top at dusk, " +
      "pink and violet sky behind, palm silhouettes far out of focus, matching fresh fruit in front of each bottle.",
  },
  story: {
    size: "1024x1536",
    prompt:
      "Editorial still life: a ZUNO Pink Lychee bottle slightly tilted, fresh lychees and raspberries around it, " +
      "soft blush-pink paper backdrop, gentle studio light, minimal and premium.",
  },
};

async function generate(id, shot) {
  const ref = await readFile(`public/experience/${id}.jpg`);
  const form = new FormData();
  form.append("model", MODEL);
  form.append("prompt", `${shot.prompt} ${STYLE}`);
  form.append("size", shot.size);
  form.append("quality", "high");
  form.append("output_format", "jpeg");
  form.append("image", new Blob([ref], { type: "image/jpeg" }), `${id}.jpg`);
  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`${id}: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${id}: no image in response`);
  // keep the render as a fallback, publish the photo under the same name
  await writeFile(`public/experience/${id}.render.jpg`, ref);
  await writeFile(`public/experience/${id}.jpg`, Buffer.from(b64, "base64"));
  console.log("generated", id);
}

(async () => {
  if (!KEY) {
    console.error("Missing OPENAI_API_KEY");
    process.exit(1);
  }
  const only = process.argv.slice(2);
  for (const [id, shot] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(id)) continue;
    await generate(id, shot);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
