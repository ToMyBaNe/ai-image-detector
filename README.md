# 🕵️‍♂️ AI Image Detector

![AI Image Detector Hero](public/hero-screenshot.png)

> **Advanced Hybrid Intelligence** for detecting AI-generated images. Combines commercial-grade APIs, cutting-edge open-source models, and privacy-first local analysis.

## 🔗 Live Demo
**[https://aiimagedetector-ten.vercel.app](https://aiimagedetector-ten.vercel.app)**

## 🚀 Features

-   **Multi-Engine Ensemble**: Combines available detector scores with local image metadata signals.
    -   **Sightengine GenAI**: Commercial-grade detection for DALL-E, Midjourney, Stable Diffusion.
    -   **Free Hugging Face Detector**: [A public community model](https://huggingface.co/spaces/ymcmy/AI_Generated_Image_Detector), included as an experimental low-weight signal. Its shared runtime can be unavailable and it can misclassify images.
    -   **Local Metadata Engine**: specialized heuristic analysis of EXIF data, AI tool markers, and entropy.
-   **Weighted Voting System**: Combines signals; results are estimates and can be wrong.
-   **Responsive UI**: Watermelon-pink and white design with smooth animations.
-   **Image handling**: Uploads are sent to enabled analysis providers, including Sightengine and Hugging Face. This app does not intentionally persist uploaded images; each provider's data policy applies.
-   **Drag & Drop**: Intuitive upload zone with file validation and preview.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: Vanilla CSS (Variables, Flexbox/Grid, Animations) - *No Tailwind dependency*
-   **AI Integration**:
    -   `@gradio/client` for Hugging Face Spaces
    -   `FormData` for Sightengine API
-   **Deployment**: [Vercel](https://vercel.com/)

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ai-image-detector.git
    cd ai-image-detector
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root directory and add your keys:
    ```env
    # Sightengine API (Get free keys at sightengine.com)
    SIGHTENGINE_API_USER=your_user_id
    SIGHTENGINE_API_SECRET=your_api_secret

    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🚀 Deployment

The easiest way to deploy is via **Vercel**.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the Environment Variables (`SIGHTENGINE_API_USER`, `SIGHTENGINE_API_SECRET`) in the Vercel project settings. The public Hugging Face detector does not require a token.
4.  Deploy!

## 🧩 Architecture

```mermaid
graph TD
    A[Image Upload] --> B[Next.js API Route /api/detect]
    B --> C1[Sightengine GenAI]
    B --> C2["Free Hugging Face detector (experimental)"]
    B --> C3[Local Metadata Analysis]
    C1 & C2 & C3 --> D[Ensemble Engine]
    D --> E[Weighted Voting Logic]
    E --> F[finalVerdict + Confidence Score]
```

## 📄 License

MIT License. Free to use and modify.
