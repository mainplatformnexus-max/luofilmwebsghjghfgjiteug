# YOUKU Website

A React + Vite website for LUOFILM/YOUKU content browsing and playback, now migrated to run in the Replit environment.

## Structure

```
/
├── src/           # React source code
├── api/           # Existing Vercel-style serverless API routes retained from import
├── public/        # Static assets
├── index.html     # Entry HTML
├── vite.config.ts # Vite configuration
├── tsconfig.json  # TypeScript configuration
├── vercel.json    # Legacy Vercel deployment config retained from original project
└── package.json   # Dependencies and scripts
```

## Development on Replit

The project runs through the Replit workflow using:

```bash
pnpm run dev
```

Vite is configured to bind to `0.0.0.0`, use the `PORT` environment variable when present, and allow proxied Replit preview hosts.

## Migration Status

- Dependencies were installed from the existing `pnpm-lock.yaml` without rewriting the project.
- The Replit workflow starts successfully on port 3000.
- The root page and SPA routes respond successfully in the Replit environment.

## Original Deployment Notes

The imported project included Vercel configuration:

- **Framework**: Vite
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
