# AI Video Maker Pro (Full-Stack Web App)

A responsive, dark-themed full-stack web application optimized for mobile (Android & iOS) and desktop browsers. It plans multi-scene video narratives with immutable character and visual continuity locks, formats text-to-video prompts, and combines generated clips into a downloadable MP4 via backend FFmpeg.

---

## Features

- **Story & Video Idea Input**: Multi-line narrative prompt field with one-tap presets in **Hindi** and **English**.
- **Duration Selection**: 15s (3 scenes), 30s (5 scenes), and 60s (8 sequential scenes).
- **Aspect Ratio Options**: 9:16 Vertical (Reels/Shorts/TikTok) and 16:9 Horizontal (YouTube/Cinema).
- **Language Support**: Hindi (हिंदी) and English, generating dialogue, voiceover, and subtitles in the selected language.
- **Visual Aesthetic Selector**: 35mm Cinematic Film, Anime 4K, Octane Hyper-Realistic, Cyberpunk Neon, and 3D Studio Stylized.
- **AI Story Planner**: Sequential scene breakdown with camera angles, lighting conditions, text-to-video prompts, and foley directions.
- **Character & Setting Continuity Locker**: Anchors immutable character traits (facial structure, wardrobe, accessories) and embeds anchor tags `[CHAR:NAME:traits]` into every scene prompt.
- **Honest Video Generation Pipeline**: Does not fake video generation. Scene statuses are marked as `Prompt Ready` or `API Required` until a real video API key is connected.
- **Script Doctor Gemini Chatbot**: Multi-turn conversation assistant with model switching between `gemini-4-argon` (with High Thinking), `gemini-3.8-flash`, and `gemini-3.1-flash-lite`.
- **FFmpeg Clip Concatenation**: Server-side `/api/video/combine` uses FFmpeg's concat demuxer to stitch MP4 clips into a single downloadable video file.
- **JSON Export**: Export the complete production plan for import into Runway, Sora, Kling, or Midjourney.

---

## Server Architecture & Security

- **Server-Side Security**: API keys (`GEMINI_API_KEY`, `RUNWAY_API_KEY`, `LUMA_API_KEY`) are kept strictly on the backend in `process.env`. They are never passed or exposed to client browsers.
- **Backend Stack**: Node.js 22 + Express on port 3000.
- **Frontend Stack**: React 19 + Tailwind CSS + Lucide Icons + Vite.

---

## Deployment to a Shareable Website URL

You can deploy this full-stack web application to any modern cloud hosting service:

### Option 1: Cloud Run / Google Cloud (Recommended)
1. In the AI Studio top navigation bar or settings, you can deploy your project directly to Google Cloud Run.
2. The provided `server.js` listens on port 3000 (or `PORT` environment variable).
3. Set your `GEMINI_API_KEY` (and optional `RUNWAY_API_KEY` or `LUMA_API_KEY`) in the Cloud Run Environment Variables settings.
4. Your application will be live at a public HTTPS URL (e.g., `https://ai-video-maker-pro-xyz.run.app`).

### Option 2: Render.com / Railway
1. Push this repository to GitHub.
2. Create a **New Web Service** on Render or Railway.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `NODE_ENV`: `production`

### Option 3: Docker Deployment
```dockerfile
FROM node:22-bullseye
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
