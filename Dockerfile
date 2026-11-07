FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY server/ ./server/
COPY src/ ./src/
RUN npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4178 LAB_DATA_DIR=/var/lib/lululab/data
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/server/ ./server/
COPY --from=build /app/src/data/labContent.js ./src/data/labContent.js
RUN install -d -m 700 -o node -g node /var/lib/lululab/data

USER node
EXPOSE 4178
CMD ["node", "server/index.js"]
