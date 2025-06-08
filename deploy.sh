#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Deploy to S3
echo "Deploying to S3..."
aws s3 sync dist/ s3://YOUR-S3-BUCKET-NAME --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id YOUR-CLOUDFRONT-DISTRIBUTION-ID --paths "/*"

echo "Deployment complete!" 