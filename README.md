<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0969da,50:8250df,100:1f883d&height=220&section=header&text=Harsh%20Chaudhary&fontSize=56&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Personal%20Portfolio%20%C2%B7%20harshchaudhary.com.np&descAlignY=58&descSize=18" alt="Harsh Chaudhary — Portfolio" width="100%" />

<a href="https://harshchaudhary.com.np">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=22&pause=1000&color=0969DA&center=true&vCenter=true&width=600&lines=Full-stack+developer+%F0%9F%9A%80;React+%2B+Laravel+portfolio;Open-source+contributor;Built+in+Kathmandu%2C+Nepal+%F0%9F%87%B3%F0%9F%87%B5" alt="Typing SVG" />
</a>

<br />

[![Live Site](https://img.shields.io/badge/Live-harshchaudhary.com.np-1f883d?style=for-the-badge&logo=googlechrome&logoColor=white)](https://harshchaudhary.com.np)
[![GitHub](https://img.shields.io/badge/GitHub-theharshchaudhary-1f2328?style=for-the-badge&logo=github&logoColor=white)](https://github.com/theharshchaudhary)

<img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,laravel,php,mysql&theme=light" alt="Tech stack" />

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="divider" width="100%" />

## ✨ About

This is the source for my personal portfolio at **[harshchaudhary.com.np](https://harshchaudhary.com.np)**. It's styled after a GitHub profile: pinned projects, a contribution heatmap, streak stats, language breakdown, an activity timeline, notes, a blog, releases, resources and a sponsor page.

- **Frontend:** React 19, React Router 8 (prerendered), TypeScript, Vite, Tailwind CSS, Lucide icons
- **Backend** *(coming soon)*: Laravel REST API serving projects, notes, blog posts and contact messages
- **Hosting:** cPanel, deployed by GitHub Actions on every push

## 🗂️ Project Structure

```text
frontend/                  React 19 + React Router 8 (prerendered static site)
├── react-router.config.ts # SSG config: every route is rendered to HTML at build time
└── src/
    ├── root.tsx           # HTML shell, site-wide loader, layout, error boundary
    ├── routes.ts          # Route table (real paths, no hash URLs)
    ├── routes/            # One module per page: loader + meta (SEO) + component
    ├── components/        # Heatmap, project cards, stats, timeline, layout
    ├── lib/
    │   ├── content.server.ts  # Build-time data layer (mock now, Laravel API next)
    │   ├── seo.ts             # Title, description, canonical, Open Graph, Twitter tags
    │   └── format.ts          # UTC-safe date and number formatting
    └── types/             # Shared TypeScript models
backend/                   Laravel API + admin panel (coming next)
docs/PLAN.md               Full build plan
```

## 🚀 Getting Started

```bash
cd frontend
npm install
npm run dev        # dev server with hot reload
npm run build      # prerender every page → build/client/
npm run typecheck  # route type generation + TypeScript
npm run lint       # ESLint
```

## 🛣️ Roadmap

- [x] React frontend scaffold
- [x] Real URLs + prerendered HTML for every page
- [ ] Laravel API backend
- [ ] Connect the frontend to live data
- [ ] CI/CD to cPanel with GitHub Actions
- [ ] Working contact form

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1f883d,50:8250df,100:0969da&height=120&section=footer&animation=twinkling" alt="footer" width="100%" />

<sub>Made with ❤️ by <a href="https://github.com/theharshchaudhary">Harsh Chaudhary</a></sub>

</div>
