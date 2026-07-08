# --- STAGE 1: BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install clean dependencies including devDependencies (needed to build)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the application for production
RUN npm run build

# --- STAGE 2: PRODUCTION SERVER ---
FROM nginx:1.25-alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build artifacts from Stage 1 to Nginx public html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx server port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
