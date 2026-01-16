# Financial Control App

## Setup Instructions

### Prerequisites
1. **Node.js**: Install from [nodejs.org](https://nodejs.org/)
2. **Docker**: Install from [docker.com](https://www.docker.com/)

### Installation
1. Open this folder in your terminal.
2. Run `npm install` to install dependencies.

### Running the Project
1. Start the Database:
   ```bash
   docker-compose up -d
   ```
2. Initialize the Database Schema:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Start the Development Server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Architecture
- **Framework**: Next.js 14
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UI**: TailwindCSS + ShadCN
