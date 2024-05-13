## Super simple JWT authentication with Express and Prisma

### Requirements

⬇️ Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/en/)
- [Docker](https://docker.io)

### Setup

🙊 Configure your Postgres database and JWT secret in `.env` file(copy the `.env.example`):


🚀 Running:

```bash
docker compose up -d

pnpm i

npx prisma db push

pnpm dev

```

Enjoy! 🙋
