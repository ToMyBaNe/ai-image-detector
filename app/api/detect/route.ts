import { NextRequest, NextResponse } from "next/server";
import { client } from "@gradio/client";

/* ==========================================================================
   MULTI-ENGINE AI IMAGE DETECTOR
   
   Detection engines:
   1. Sightengine GenAI        — Commercial AI generation detector
   2. Sightengine Deepfake     — Deepfake face manipulation detector
   3. ymcmy/AI_Generated_Image_Detector — Free public Hugging Face Space
   4. Local Metadata Engine    — Privacy-first metadata & entropy analysis
   ========================================================================== */

// ─── Free Hugging Face detector (experimental) ────────────────────────────

async function queryFreeHuggingFaceDetector(
    imageBlob: Blob
): Promise<{
    aiScore: number;
    humanScore: number;
} | null> {
    try {
        const app = await client("ymcmy/AI_Generated_Image_Detector");
        const result = await app.predict("/predict", [imageBlob]);
        if (!Array.isArray(result.data) || result.data.length === 0) {
            throw new Error("Hugging Face detector returned no result");
        }
        const output: unknown = result.data[0];

        if (typeof output !== "string") {
            throw new Error("Unexpected response from the Hugging Face detector");
        }

        const scoreMatch = output.match(/(\d+(?:\.\d+)?)\s*%/);
        const aiScore = scoreMatch ? Number(scoreMatch[1]) : Number.NaN;
        if (!Number.isFinite(aiScore) || aiScore < 0 || aiScore > 100) {
            throw new Error("Hugging Face detector returned an invalid AI score");
        }

        return {
            aiScore: Math.round(aiScore * 100) / 100,
            humanScore: Math.round((100 - aiScore) * 100) / 100,
        };

    } catch (error) {
        console.error("Free Hugging Face detector error:", error);
        return null;
    }
}

// ─── Sightengine API ─────────────────────────────────────────────────────

async function querySightengine(
    imageBlob: Blob
): Promise<{
    genai: { aiScore: number; humanScore: number } | null;
    error?: string;
}> {
    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_SECRET;

    if (!apiUser || !apiSecret) {
        const missingVariables = [
            !apiUser && "SIGHTENGINE_API_USER",
            !apiSecret && "SIGHTENGINE_API_SECRET",
        ].filter(Boolean);
        const error = `Missing Vercel environment variable(s): ${missingVariables.join(", ")}`;
        console.error(`Sightengine disabled: ${error}`);
        return { genai: null, error };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
        const formData = new FormData();
        formData.append("media", imageBlob, "image.jpg");
        formData.append("models", "genai");
        formData.append("api_user", apiUser);
        formData.append("api_secret", apiSecret);

        const response = await fetch("https://api.sightengine.com/1.0/check.json", {
            method: "POST",
            body: formData,
            signal: controller.signal,
        });

        if (!response.ok) {
            console.error(`Sightengine request failed with HTTP ${response.status}`);
            return { genai: null, error: `Sightengine returned HTTP ${response.status}` };
        }

        const data = await response.json();
        if (data.status !== "success") {
            console.error("Sightengine rejected the request", {
                status: data.status,
                errorCode: data.error?.code,
            });
            return {
                genai: null,
                error: "Sightengine rejected the request. Check the credentials and API quota in Vercel logs.",
            };
        }

        const genaiVal = data.type?.ai_generated;
        if (typeof genaiVal !== "number" || !Number.isFinite(genaiVal)) {
            console.error("Sightengine response did not include a valid type.ai_generated score");
            return { genai: null, error: "Sightengine did not return an AI-generated score" };
        }

        return {
            genai: {
                aiScore: Math.round(genaiVal * 10000) / 100,
                humanScore: Math.round((1 - genaiVal) * 10000) / 100,
            },
        };
    } catch (error) {
        console.error("Sightengine request error:", error);
        return {
            genai: null,
            error: "Sightengine request failed. Check Vercel function logs for details.",
        };
    } finally {
        clearTimeout(timeout);
    }
}

// ─── Local Metadata Engine ───────────────────────────────────────────────

async function analyzeImageMetadata(
    imageBlob: Blob
): Promise<{ aiScore: number; humanScore: number; details: string }> {
    /* ... (Same implementation as before) ... */
    const buffer = await imageBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let aiSignals = 0;
    let signalDetails: string[] = [];

    // 1. Check JPEG EXIF
    const isJPEG = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50;

    if (isJPEG) {
        let hasExif = false;
        for (let i = 0; i < Math.min(bytes.length, 2000); i++) {
            if (bytes[i] === 0x45 && bytes[i + 1] === 0x78 && bytes[i + 2] === 0x69 && bytes[i + 3] === 0x66) {
                hasExif = true;
                break;
            }
        }
        if (!hasExif) {
            aiSignals += 20;
            signalDetails.push("No EXIF metadata (common in AI images)");
        } else {
            signalDetails.push("EXIF metadata present");
        }
    }

    // 2. Check for AI tool markers
    const headerSize = Math.min(bytes.length, 15000);
    const metaStr = new TextDecoder("ascii", { fatal: false }).decode(bytes.slice(0, headerSize));
    const aiMarkers = [
        "DALL", "Midjourney", "Stable Diffusion", "ComfyUI", "A1111",
        "NovelAI", "nai_generated", "dreamstudio", "invoke-ai",
        "sd-metadata", "Dream Studio", "Flux", "SDXL",
    ];
    for (const marker of aiMarkers) {
        if (metaStr.toLowerCase().includes(marker.toLowerCase())) {
            aiSignals += 60;
            signalDetails.push(`AI tool marker found: "${marker}"`);
            break;
        }
    }

    // 3. PNG-specific checks
    if (isPNG) {
        const pngMeta = metaStr.toLowerCase();
        if (pngMeta.includes("parameters") && (pngMeta.includes("steps") || pngMeta.includes("sampler"))) {
            aiSignals += 55;
            signalDetails.push("Stable Diffusion parameters detected");
        }
        if (pngMeta.includes("prompt") && pngMeta.includes("negative")) {
            aiSignals += 50;
            signalDetails.push("AI prompt metadata found");
        }
    }

    // 4. Entropy analysis
    const sampleSize = Math.min(bytes.length, 20000);
    const freq = new Array(256).fill(0);
    for (let i = 0; i < sampleSize; i++) {
        freq[bytes[i]]++;
    }
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
        if (freq[i] > 0) {
            const p = freq[i] / sampleSize;
            entropy -= p * Math.log2(p);
        }
    }
    if (entropy > 7.5 && entropy < 7.95) {
        aiSignals += 8;
        signalDetails.push(`High entropy (${entropy.toFixed(2)}) suggests AI processing`);
    }

    // 5. File size heuristic
    if (isJPEG && bytes.length > 200000 && bytes.length < 800000) {
        aiSignals += 5;
    }

    // Cap human confidence for non-standard files without strong signals
    const finalAiScore = Math.min(aiSignals, 99);
    let finalHumanScore = 100 - finalAiScore;

    // If no AI signals found but also no strong human signals (like EXIF), reduce confidence
    if (finalAiScore < 10 && !isJPEG) {
        finalHumanScore = 80; // Cap at 80% for PNGs without AI markers
    }

    let summary: string;
    if (finalAiScore >= 50) summary = signalDetails[0] || "AI indicators detected";
    else if (finalAiScore >= 20) summary = signalDetails[0] || "Minor AI indicators found";
    else summary = "No strong AI indicators in metadata";

    return {
        aiScore: Math.round(finalAiScore * 100) / 100,
        humanScore: Math.round(finalHumanScore * 100) / 100,
        details: summary,
    };
}


// ─── Main API Route ──────────────────────────────────────────────────────

interface ModelResultEntry {
    model: string;
    modelId: string;
    architecture: string;
    weight: number;
    aiScore: number;
    humanScore: number;
    verdict: "ai" | "human" | "error";
    error?: string;
    details?: string;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload JPEG, PNG, WebP, GIF, or BMP." },
                { status: 400 }
            );
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const imageBlob = new Blob([arrayBuffer], { type: file.type });

        const startTime = Date.now();

        // ─── Run all engines in parallel ──────────────────────────
        const [sightengineResult, freeHuggingFaceResult, metadataResult] = await Promise.all([
            querySightengine(imageBlob),
            queryFreeHuggingFaceDetector(imageBlob),
            analyzeImageMetadata(imageBlob),
        ]);

        const analysisTime = Date.now() - startTime;

        // ─── Assemble results ─────────────────────────────────────
        const modelResults: ModelResultEntry[] = [];

        // 1. Sightengine GenAI
        if (sightengineResult.genai) {
            modelResults.push({
                model: "Sightengine GenAI",
                modelId: "sightengine/genai",
                architecture: "Commercial AI Generator Detector",
                weight: 1.0,
                aiScore: sightengineResult.genai.aiScore,
                humanScore: sightengineResult.genai.humanScore,
                verdict: sightengineResult.genai.aiScore > 50 ? "ai" : "human",
            });
        } else {
            modelResults.push({
                model: "Sightengine GenAI",
                modelId: "sightengine/genai",
                architecture: "Commercial AI Generator Detector",
                weight: 0,
                aiScore: 0,
                humanScore: 0,
                verdict: "error",
                error: sightengineResult.error || "Sightengine did not return a result",
            });
        }

        // 2. Sightengine Deepfake - REMOVED per user request

        // 3. Free public Hugging Face detector (experimental)
        if (freeHuggingFaceResult) {
            modelResults.push({
                model: "Free Hugging Face Detector",
                modelId: "ymcmy/AI_Generated_Image_Detector",
                architecture: "Public model (experimental)",
                weight: 0.35,
                aiScore: freeHuggingFaceResult.aiScore,
                humanScore: freeHuggingFaceResult.humanScore,
                verdict: freeHuggingFaceResult.aiScore > freeHuggingFaceResult.humanScore ? "ai" : "human",
            });
        } else {
            console.warn("Free Hugging Face detector is unavailable");
            modelResults.push({
                model: "Free Hugging Face Detector",
                modelId: "ymcmy/AI_Generated_Image_Detector",
                architecture: "Public model (experimental)",
                weight: 0,
                aiScore: 0,
                humanScore: 0,
                verdict: "error",
                error: "The free Hugging Face detector is unavailable",
            });
        }

        // 4. Local Analysis
        modelResults.push({
            model: "Metadata Analyzer",
            modelId: "local/metadata",
            architecture: "Local Heuristic Engine",
            weight: 0.3,
            aiScore: metadataResult.aiScore,
            humanScore: metadataResult.humanScore,
            verdict: metadataResult.aiScore > metadataResult.humanScore ? "ai" : "human",
            details: metadataResult.details,
        });

        // ─── ENSEMBLE Logic ───────────────────────────────────────
        const successfulModels = modelResults.filter((m) => m.verdict !== "error");

        if (successfulModels.length === 0) {
            return NextResponse.json(
                { error: "All detection services are currently unavailable." },
                { status: 503 }
            );
        }

        let weightedAiScore = 0;
        let totalWeight = 0;

        for (const model of successfulModels) {
            weightedAiScore += model.aiScore * model.weight;
            totalWeight += model.weight;
        }

        const combinedAiScore = totalWeight > 0 ? weightedAiScore / totalWeight : 0;
        const combinedHumanScore = 100 - combinedAiScore;

        // Majority vote
        const aiVotes = successfulModels.filter((m) => m.verdict === "ai").length;
        const humanVotes = successfulModels.filter((m) => m.verdict === "human").length;
        const totalVotes = aiVotes + humanVotes;
        const majorityAgreement = totalVotes > 0 ? Math.max(aiVotes, humanVotes) / totalVotes : 0;

        // Final verdict
        let finalVerdict: "ai" | "human" | "uncertain";
        if (Math.abs(combinedAiScore - combinedHumanScore) < 10 && majorityAgreement < 0.7) {
            finalVerdict = "uncertain";
        } else {
            finalVerdict = combinedAiScore > combinedHumanScore ? "ai" : "human";
        }

        const confidenceScore = Math.min(99.9, Math.max(combinedAiScore, combinedHumanScore) + (majorityAgreement > 0.8 ? 2 : 0));

        const consensusLevel = majorityAgreement >= 0.8 ? "strong" : majorityAgreement >= 0.6 ? "moderate" : "weak";

        return NextResponse.json({
            verdict: finalVerdict,
            confidence: Math.round(confidenceScore * 100) / 100,
            aiScore: Math.round(combinedAiScore * 100) / 100,
            humanScore: Math.round(combinedHumanScore * 100) / 100,
            models: modelResults.map((m) => ({
                model: m.model,
                modelId: m.modelId,
                architecture: m.architecture,
                aiScore: m.aiScore,
                humanScore: m.humanScore,
                verdict: m.verdict,
                error: m.error,
                details: m.details,
            })),
            ensemble: {
                method: "weighted_average_vote",
                totalModels: modelResults.length,
                successfulModels: successfulModels.length,
                aiVotes,
                humanVotes,
                majorityAgreement: Math.round(majorityAgreement * 100),
                consensusLevel,
            },
            analysisTime,
            modelsUsed: successfulModels.length,
        });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Internal server error during analysis" },
            { status: 500 }
        );
    }
}
