# Node.js
FROM node:18

# Work directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json, pnpm-lock.yaml to workdir
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the project
COPY . .

# Build app
RUN pnpm run build

# Run app
CMD ["pnpm", "run", "start"]