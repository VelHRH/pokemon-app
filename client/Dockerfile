# Development Dockerfile for Vite React
FROM node:20-alpine

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
COPY shared/ /app/shared/

EXPOSE 5173

# Vite must bind to 0.0.0.0 inside container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

