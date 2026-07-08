#!/bin/bash

# --- HUREX ERP PRODUCTION BACKUP AUTOMATION SCRIPT ---
# This script bundles and backups current deployment files, custom server configs, 
# and provides secure archive compression for system redundancy.

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="hurex_erp_deployment_$TIMESTAMP.tar.gz"

echo "============================================================"
echo "          HUREX ERP - SYSTEM DEPLOYMENT BACKUP              "
echo "============================================================"

# Create backups directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Creating backups directory..."
    mkdir -p "$BACKUP_DIR"
fi

echo "Archiving core application deployment files..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="dist" \
    --exclude="backups" \
    .

echo "✓ Core application deployment files backed up successfully!"
echo "Backup location: $BACKUP_DIR/$BACKUP_NAME"
echo "Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"

# Generate a guide on how to backup browser local state
CAT_GUIDE="$BACKUP_DIR/data_backup_instructions_$TIMESTAMP.txt"
cat << 'EOF' > "$CAT_GUIDE"
============================================================
              HUREX ERP DATA PERSISTENCE & BACKUP GUIDE
============================================================

Hurex ERP is designed as a secure, fast, offline-first application. 
All customer, inventory, sales, expenses, and affiliate records are 
safely stored directly in the local browser database (localStorage).

To backup your live business data:
1. Open the Hurex ERP Application in your browser.
2. Navigate to the "Backup & Restore" (Hifadhi & Rejesha) section 
   from the main side navigation.
3. Click "Create Backup" (Tengeneza Hifadhi ya Data).
4. Save the generated `.json` backup file securely in a cloud storage 
   drive or physical backup disk.

To restore business data on any new device or after browser clear:
1. Open Hurex ERP in the target browser.
2. Go to the "Backup & Restore" tab.
3. Click "Import Backup / Restore File".
4. Upload your saved `.json` backup file.
5. All records, catalogs, transactions, and commission tables will 
   be fully restored and populated immediately.
============================================================
EOF

echo "✓ Data Backup & Restore Guide generated at: $CAT_GUIDE"
echo "============================================================"
echo "Backup execution finished successfully!"
echo "============================================================"
