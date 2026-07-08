#!/bin/bash

# --- HUREX ERP ONE-CLICK VPS DEPLOYMENT ENGINE ---
# Automated provisioning and deployment script for Ubuntu/Debian servers.
# It ensures Docker and Compose are installed, builds the production Nginx web container,
# and deploys it on port 3000 instantly with zero vendor lock-in.

set -e

echo "====================================================================="
echo "        HUREX ERP - ONE-CLICK PRODUCTION VPS DEPLOYER                "
echo "====================================================================="

# 1. Detect environment and requirements
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Warning: This script is not running as root/sudo. If package installation is needed, it may prompt for your password."
fi

# Function to check command existence
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# 2. Check & Install Docker
if ! command_exists docker; then
  echo "Docker is not installed. Setting up Docker Engine..."
  if command_exists apt-get; then
    apt-get update -y
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io
    echo "✓ Docker installed successfully!"
  else
    echo "❌ Unrecognized package manager. Please install Docker manually first: https://docs.docker.com/engine/install/"
    exit 1
  fi
else
  echo "✓ Docker is already installed."
fi

# 3. Check & Install Docker Compose
if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is not installed. Installing Docker Compose CLI plugin..."
  if command_exists apt-get; then
    apt-get update -y
    apt-get install -y docker-compose-plugin
    echo "✓ Docker Compose installed successfully!"
  else
    echo "❌ Docker Compose not found. Please install docker-compose manually first: https://docs.docker.com/compose/install/"
    exit 1
  fi
else
  echo "✓ Docker Compose is already installed."
fi

# 4. Build and run production containers
echo "Building and launching Hurex ERP Nginx Production container..."
if docker compose version >/dev/null 2>&1; then
  docker compose down --remove-orphans || true
  docker compose up -d --build
else
  docker-compose down --remove-orphans || true
  docker-compose up -d --build
fi

echo "====================================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "====================================================================="
echo "Hurex ERP is now running as a fully independent production system."
echo "Access URL: http://localhost:3000"
echo "Public Access: Configure Nginx Reverse Proxy with SSL on your domain."
echo "====================================================================="
