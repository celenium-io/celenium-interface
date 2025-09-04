FROM node:20

WORKDIR /app

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install --legacy-peer-deps
RUN npm run build

CMD ["npm", "run", "start"]
