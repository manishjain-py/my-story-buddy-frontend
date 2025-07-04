# Frontend Setup Instructions

## Prerequisites
- Node.js (v18+)
- npm

## Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/manishjain-py/my-story-buddy-frontend.git
   cd my-story-buddy-frontend
   npm install
   ```

2. **Environment setup**
   Create `.env.local`:
   ```
   VITE_API_URL=http://localhost:8003
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

## Other Commands
```bash
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

## Notes
- Backend must be running on port 8003 for local development
- Production automatically deploys via GitHub Actions on push to main