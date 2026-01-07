# Use official Node.js LTS image
FROM node:18-alpine

# 🔧 Install curl (required for Docker healthcheck)
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the frontend source
COPY . .

# Expose frontend port
EXPOSE 3000

# Health check for Docker
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start frontend server
CMD ["npm", "start"]

