# YOUKU Website

A React + Vite website for YOUKU, deployed on Vercel.

## Structure

```
/
├── src/           # React source code
├── api/           # Vercel serverless API routes
├── public/        # Static assets
├── index.html     # Entry HTML
├── vite.config.ts # Vite configuration
├── tsconfig.json  # TypeScript configuration
├── vercel.json    # Vercel deployment config
└── package.json   # Dependencies
```

## Development

```bash
pnpm install
pnpm run dev
```

## Deployment (Vercel)

Settings to use when importing the repo:
- **Root Directory**: (leave blank — repo root)
- **Framework**: Vite
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
