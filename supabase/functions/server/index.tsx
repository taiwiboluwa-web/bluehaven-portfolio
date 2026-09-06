import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-cf1ab75b/health", (c) => {
  return c.json({ status: "ok" });
});

// AI Packaging Generator endpoint
app.post("/make-server-cf1ab75b/generate-packaging", async (c) => {
  try {
    const { logoBase64, packagingType, provider = "openai" } = await c.req.json();

    if (!logoBase64 || !packagingType) {
      return c.json({ error: "Missing required fields: logoBase64 and packagingType" }, 400);
    }

    // Get API keys from environment (set in Supabase settings)
    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    const stabilityKey = Deno.env.get("STABILITY_API_KEY")?.trim();

    // Build the prompt
    const prompt = `Using the provided logo image, create a Professional industrial design packaging illustration sheet for a ${packagingType.toLowerCase()} package. Centered hero 3D render with realistic materials, soft studio lighting, and commercial-quality finish. Surrounded by technical views: front, side, top, bottom, angled perspective, and flat lay. Include wireframe construction sketches, fold lines, seam details, and dimension arrows in millimeters. Show material and finish callouts (matte, glossy print, plastic, paper, glass, etc.) in handwritten annotations. Add color swatches, realistic product illustration, and subtle shadows. Clean off-white sketchbook background, hybrid realistic render + pencil sketch style, modern product design documentation layout, ultra-detailed, portfolio-ready.`;

    let imageUrl = "";

    if (provider === "openai" && openaiKey) {
      // Log for debugging (first 10 chars only)
      console.log(`Using OpenAI key starting with: ${openaiKey.substring(0, 10)}...`);

      // OpenAI DALL-E 3 API
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1792", // Portrait orientation for packaging
          quality: "hd",
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("OpenAI API Error Response:", error);

        // Provide more helpful error messages
        if (response.status === 401) {
          throw new Error("Invalid OpenAI API key. Please verify your API key in Supabase settings and redeploy the function.");
        } else if (response.status === 429) {
          throw new Error("OpenAI rate limit exceeded or insufficient credits. Please check your OpenAI account.");
        } else {
          throw new Error(`OpenAI API error (${response.status}): ${JSON.stringify(error)}`);
        }
      }

      const data = await response.json();
      imageUrl = data.data[0].url;

    } else if (provider === "stability" && stabilityKey) {
      // Stability AI (text-to-image with optional image reference)
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("output_format", "png");
      formData.append("aspect_ratio", "9:16"); // Portrait for packaging

      // If we want to use the logo as a reference (optional)
      // Convert base64 to blob and add as init_image
      const base64Data = logoBase64.split(',')[1];
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      formData.append("image", blob, "logo.png");
      formData.append("strength", "0.5"); // How much to transform the input image

      const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stabilityKey}`,
          "Accept": "image/*",
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Stability AI error: ${error}`);
      }

      // Convert response to base64
      const imageBuffer = await response.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
      imageUrl = `data:image/png;base64,${base64Image}`;

    } else {
      return c.json({
        error: `Provider '${provider}' not configured. Please add ${provider === "openai" ? "OPENAI_API_KEY" : "STABILITY_API_KEY"} to Supabase environment secrets.`
      }, 400);
    }

    return c.json({
      success: true,
      imageUrl,
      provider,
    });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return c.json({
      error: error.message || "Failed to generate packaging design"
    }, 500);
  }
});

Deno.serve(app.fetch);
