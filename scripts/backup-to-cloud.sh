#!/bin/bash

# QR Listener Cloud Backup Script
# This script creates daily backups and uploads them to cloud storage
# Supports AWS S3, Google Cloud Storage, and Azure Blob Storage

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/qr-listener/backups"
DB_NAME="qr_listener"
DB_USER="qr_user"
CONTAINER_NAME="qr-listener-postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="qr-listener-backup-${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# Cloud storage configuration (set via environment variables)
CLOUD_PROVIDER="${CLOUD_PROVIDER:-aws}"  # aws, gcp, azure
BUCKET_NAME="${BUCKET_NAME}"
REGION="${REGION:-us-east-1}"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
AWS_S3_BUCKET="${AWS_S3_BUCKET}"

# Google Cloud Storage Configuration
GCP_PROJECT_ID="${GCP_PROJECT_ID}"
GCP_BUCKET_NAME="${GCP_BUCKET_NAME}"
GCP_CREDENTIALS_FILE="${GCP_CREDENTIALS_FILE}"

# Azure Blob Storage Configuration
AZURE_STORAGE_ACCOUNT="${AZURE_STORAGE_ACCOUNT}"
AZURE_STORAGE_KEY="${AZURE_STORAGE_KEY}"
AZURE_CONTAINER_NAME="${AZURE_CONTAINER_NAME}"

# Retention policy
RETENTION_DAYS="${RETENTION_DAYS:-30}"
LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-7}"

echo -e "${BLUE}🔄 Starting QR Listener Cloud Backup${NC}"
echo "Timestamp: $(date)"
echo "Cloud Provider: $CLOUD_PROVIDER"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}📁 Creating backup directory: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Check if PostgreSQL container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ PostgreSQL container '$CONTAINER_NAME' is not running${NC}"
    echo -e "${YELLOW}💡 Start the container first: docker-compose -f docker-compose.postgres-only.yml up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL container is running${NC}"

# Create database backup
echo -e "${BLUE}📊 Creating database backup...${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --no-password > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup created: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ Database backup failed${NC}"
    exit 1
fi

# Compress backup
echo -e "${BLUE}🗜️  Compressing backup...${NC}"
gzip "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup compressed: $BACKUP_FILE_COMPRESSED${NC}"
else
    echo -e "${RED}❌ Backup compression failed${NC}"
    exit 1
fi

# Get backup file size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE_COMPRESSED" | cut -f1)
echo -e "${BLUE}📏 Backup size: $BACKUP_SIZE${NC}"

# Upload to cloud storage based on provider
case "$CLOUD_PROVIDER" in
    "aws")
        upload_to_aws_s3
        ;;
    "gcp")
        upload_to_gcp
        ;;
    "azure")
        upload_to_azure
        ;;
    *)
        echo -e "${YELLOW}⚠️  No cloud provider specified. Backup saved locally only.${NC}"
        echo -e "${YELLOW}💡 Set CLOUD_PROVIDER environment variable (aws, gcp, azure)${NC}"
        ;;
esac

# Clean up old local backups
echo -e "${BLUE}🧹 Cleaning up old local backups...${NC}"
find "$BACKUP_DIR" -name "qr-listener-backup-*.sql.gz" -mtime +$LOCAL_RETENTION_DAYS -delete

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Old local backups cleaned up${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to clean up old local backups${NC}"
fi

echo -e "${GREEN}🎉 Backup process completed successfully!${NC}"
echo -e "${BLUE}📊 Backup Summary:${NC}"
echo "  File: $BACKUP_FILE_COMPRESSED"
echo "  Size: $BACKUP_SIZE"
echo "  Location: $BACKUP_DIR"
echo "  Cloud: $CLOUD_PROVIDER"
echo "  Timestamp: $(date)"

# Function to upload to AWS S3
upload_to_aws_s3() {
    echo -e "${BLUE}☁️  Uploading to AWS S3...${NC}"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        echo -e "${YELLOW}💡 Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html${NC}"
        return 1
    fi
    
    # Check if AWS credentials are configured
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        echo -e "${YELLOW}💡 Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables${NC}"
        return 1
    fi
    
    # Check if S3 bucket is specified
    if [ -z "$AWS_S3_BUCKET" ]; then
        echo -e "${RED}❌ AWS S3 bucket not specified${NC}"
        echo -e "${YELLOW}💡 Set AWS_S3_BUCKET environment variable${NC}"
        return 1
    fi
    
    # Upload to S3
    aws s3 cp "$BACKUP_DIR/$BACKUP_FILE_COMPRESSED" "s3://$AWS_S3_BUCKET/backups/" --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup uploaded to S3: s3://$AWS_S3_BUCKET/backups/$BACKUP_FILE_COMPRESSED${NC}"
        
        # Set lifecycle policy for old backups
        aws s3api put-bucket-lifecycle-configuration --bucket "$AWS_S3_BUCKET" --lifecycle-configuration '{
            "Rules": [
                {
                    "ID": "DeleteOldBackups",
                    "Status": "Enabled",
                    "Filter": {"Prefix": "backups/"},
                    "Expiration": {"Days": '$RETENTION_DAYS'}
                }
            ]
        }' 2>/dev/null || echo -e "${YELLOW}⚠️  Could not set lifecycle policy (bucket may not exist)${NC}"
    else
        echo -e "${RED}❌ Failed to upload backup to S3${NC}"
        return 1
    fi
}

# Function to upload to Google Cloud Storage
upload_to_gcp() {
    echo -e "${BLUE}☁️  Uploading to Google Cloud Storage...${NC}"
    
    # Check if gsutil is installed
    if ! command -v gsutil &> /dev/null; then
        echo -e "${RED}❌ Google Cloud SDK is not installed${NC}"
        echo -e "${YELLOW}💡 Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install${NC}"
        return 1
    fi
    
    # Check if GCP credentials are configured
    if [ -z "$GCP_PROJECT_ID" ] || [ -z "$GCP_BUCKET_NAME" ]; then
        echo -e "${RED}❌ GCP configuration not complete${NC}"
        echo -e "${YELLOW}💡 Set GCP_PROJECT_ID and GCP_BUCKET_NAME environment variables${NC}"
        return 1
    fi
    
    # Set project
    gcloud config set project "$GCP_PROJECT_ID"
    
    # Upload to GCS
    gsutil cp "$BACKUP_DIR/$BACKUP_FILE_COMPRESSED" "gs://$GCP_BUCKET_NAME/backups/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup uploaded to GCS: gs://$GCP_BUCKET_NAME/backups/$BACKUP_FILE_COMPRESSED${NC}"
        
        # Set lifecycle policy for old backups
        gsutil lifecycle set /dev/stdin "gs://$GCP_BUCKET_NAME" << EOF
{
    "rule": [
        {
            "action": {"type": "Delete"},
            "condition": {"age": $RETENTION_DAYS}
        }
    ]
}
EOF
    else
        echo -e "${RED}❌ Failed to upload backup to GCS${NC}"
        return 1
    fi
}

# Function to upload to Azure Blob Storage
upload_to_azure() {
    echo -e "${BLUE}☁️  Uploading to Azure Blob Storage...${NC}"
    
    # Check if az CLI is installed
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI is not installed${NC}"
        echo -e "${YELLOW}💡 Install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli${NC}"
        return 1
    fi
    
    # Check if Azure credentials are configured
    if [ -z "$AZURE_STORAGE_ACCOUNT" ] || [ -z "$AZURE_STORAGE_KEY" ] || [ -z "$AZURE_CONTAINER_NAME" ]; then
        echo -e "${RED}❌ Azure configuration not complete${NC}"
        echo -e "${YELLOW}💡 Set AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_KEY, and AZURE_CONTAINER_NAME environment variables${NC}"
        return 1
    fi
    
    # Set storage account key
    export AZURE_STORAGE_KEY="$AZURE_STORAGE_KEY"
    
    # Upload to Azure Blob
    az storage blob upload --account-name "$AZURE_STORAGE_ACCOUNT" --container-name "$AZURE_CONTAINER_NAME" --file "$BACKUP_DIR/$BACKUP_FILE_COMPRESSED" --name "backups/$BACKUP_FILE_COMPRESSED"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup uploaded to Azure: $AZURE_STORAGE_ACCOUNT/$AZURE_CONTAINER_NAME/backups/$BACKUP_FILE_COMPRESSED${NC}"
    else
        echo -e "${RED}❌ Failed to upload backup to Azure${NC}"
        return 1
    fi
}
