FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Ensure data directory exists and has write permissions
RUN mkdir -p data && chmod -R 777 data

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3000

# Expose server port
EXPOSE 3000

# Start server
CMD ["node", "server/server.js"]
