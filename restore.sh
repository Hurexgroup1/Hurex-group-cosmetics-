#!/bin/bash

# --- HUREX ERP PRODUCTION RESTORE AUTOMATION SCRIPT ---
# This script extracts deployment archives and restores custom configurations 
# to ensure zero platform lock-in and seamless system migration.

set -e

echo "============================================================"
echo "          HUREX ERP - SYSTEM DEPLOYMENT RESTORE             "
echo "============================================================"

# Check if a backup file was provided
if [ -z "$1" ]; then
    echo "❌ Error: No backup file specified!"
    echo "Usage: ./restore.sh <path_to_backup_file.tar.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found at: $BACKUP_FILE"
    exit 1
fi

echo "Found backup file: $BACKUP_FILE"
echo "This will replace current local config files and Dockerfile setups."
read -p "Are you sure you want to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restoration aborted."
    exit 1
fi

echo "Restoring from backup..."
tar -xzf "$BACKUP_FILE" -C .

echo "✓ Core application deployment files and settings restored!"
echo "If Docker was running, run: docker compose down && docker compose up -d --build"
echo "============================================================"
echo "Restoration process complete."
echo "============================================================"
