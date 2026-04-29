# Development Dockerfile with hot-reload support
FROM node:20-alpine

# Set working directory
WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy server source + shared types
COPY server/ ./
COPY shared/ ./shared/

# Expose port
EXPOSE 3000

# Start development server with hot-reload
CMD ["npm", "run", "start:dev"]