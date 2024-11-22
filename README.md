# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Choose your preferred package manager and run one of the following commands:

```bash
# Using npm
npm install

# Using pnpm
pnpm install

# Using Bun
bun install
```

### Development

Run an initial database migration:

```bash
# Using npm
npm run db:migrate

# Using pnpm
pnpm db:migrate

# Using Bun
bun run db:migrate
```

Start the development server with HMR:

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev

# Using Bun
bun dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
# Using npm
npm run build

# Using pnpm
pnpm build

# Using Bun
bun run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To deploy directly to production:

```sh
# Using npm
npx wrangler deploy

# Using pnpm
pnpm dlx wrangler deploy

# Using bun
bunx wrangler deploy
```

To deploy a preview URL:

```sh
# Using npm
npx wrangler versions upload

# Using pnpm
pnpm dlx wrangler versions upload

# Using bun
bunx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
# Using npm
npx wrangler versions deploy

# Using pnpm
pnpm dlx wrangler versions deploy

# Using bun
bunx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
