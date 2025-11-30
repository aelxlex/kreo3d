// server.js
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cors = require("cors");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
app.use(cors());

// Configuración de multer para subir archivos al directorio temporal
const upload = multer({ dest: "uploads/" });

// Utilidad: subir el archivo a Replicate (endpoint de archivos
const path = require("path");

async function uploadFileToReplicate(filePath) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    form.submit(
      {
        host: "api.replicate.com",
        path: "/v1/files",
        protocol: "https:",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          ...form.getHeaders(),
        },
      },
      (err, res) => {
        if (err) return reject(err);

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Error subiendo archivo: ${res.statusCode} ${data}`));
          }
          try {
            const json = JSON.parse(data);
            resolve(json.url);
          } catch (e) {
            reject(new Error("Error al parsear respuesta de Replicate"));
          }
        });
      }
    );
  });
}
// Endpoint principal: recibe imagen y parámetros, genera preview
app.post("/api/preview", upload.single("imagen"), async (req, res) => {
  try {
    const { tipo, altura, comentarios } = req.body;
    const file = req.file;

    if (!file || !fs.existsSync(file.path)) {
      return res.status(400).json({ error: "No se recibió imagen válida" });
    }

    // 1) Subimos la imagen del usuario a Replicate
    const imageUrl = await uploadFileToReplicate(file.path);

    // 2) Prompt que fuerza estilo “impreso en 3D”
    const prompt = `
Photorealistic 3D-printed ${tipo} made from PLA plastic, visible layer lines, matte finish,
studio lighting, shallow depth of field, professional product photo on neutral background.
${comentarios ? "Details: " + comentarios : ""}
    `.trim();

    // 3) Llamada al modelo image-to-image (Stable Diffusion Img2Img en Replicate)
    const body = {
      version: "15a3689e86d3c3c7f3d9e5f0f2f3f3d5e6c8b9a0d4f1e2c3b",
      input: {
        prompt,
        image: imageUrl,
        strength: 0.55,
        guidance_scale: 7.5,
        num_inference_steps: 40,
        scheduler: "DPMSolverMultistep",
        // negative_prompt: "smooth surface, metallic, glossy, no layer lines"
      },
    };

    const predResp = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!predResp.ok) {
      throw new Error(`Error creando predicción: ${predResp.status} ${await predResp.text()}`);
    }

    const prediction = await predResp.json();

    // 4) Polling hasta que termine
    let status = prediction.status;
    let output = prediction.output;
    let predictionId = prediction.id;

    while (status === "starting" || status === "processing") {
      await new Promise((r) => setTimeout(r, 2000));
      const check = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
      });
      const checkJson = await check.json();
      status = checkJson.status;
      output = checkJson.output;
      if (status === "failed") {
        throw new Error("La predicción falló");
      }
    }

    // Limpieza del archivo local
    fs.unlink(file.path, () => {});

    // 5) Responder con la imagen generada
    const resultUrl = Array.isArray(output) ? output[0] : output;
    return res.json({
      ok: true,
      image: resultUrl,
      meta: { tipo, altura, comentarios },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error generando preview", detail: err.message });
  }
});

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));