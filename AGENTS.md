# Persistent Project Rules & Configuration

## 1. GitHub Pages Configuration (MANDATORY & IMMUTABLE)
This project is deployed to GitHub Pages at `https://junji88sekai.github.io/PDF-/`.
The following settings MUST NEVER be removed, reverted, or overwritten in future edits:
- **`vite.config.ts`**: The `base` property MUST remain set to `'/PDF-/'`:
  ```ts
  export default defineConfig(() => {
    return {
      base: '/PDF-/',
      ...
    };
  });
  ```
- **`package.json`**: The `devDependencies.esbuild` version MUST be `"^0.28.2"` (to maintain compatibility with Vite 8.3.0+):
  ```json
  "devDependencies": {
    "esbuild": "^0.28.2"
  }
  ```
- **Asset Paths**: All assets, scripts, and CSS must rely on Vite's base path resolution. Do not introduce hardcoded root-relative paths like `/assets/...` or `/src/...` in HTML or JSX.

## 2. API & Server Preservation
- Do NOT delete or modify `/api/gemini/generate-toc` or the Express backend code in `server.ts`. Maintain full compatibility for both local full-stack execution and static deployment.
