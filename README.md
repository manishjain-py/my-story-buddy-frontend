# My Story Buddy Frontend

A delightful story generation app for children.

## Development

```bash
npm install
npm run dev
```

## Deployment

The application is automatically deployed to AWS S3 and CloudFront when changes are pushed to the main branch.

### Setting up GitHub Actions

To enable automated deployments, you need to set up the following secrets in your GitHub repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key ID
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
   - `CLOUDFRONT_DISTRIBUTION_ID`: Your CloudFront distribution ID

### Required AWS Permissions

The AWS user needs the following permissions:
- `s3:PutObject`
- `s3:DeleteObject`
- `s3:ListBucket`
- `cloudfront:CreateInvalidation`

Example IAM policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::my-story-buddy-frontend",
                "arn:aws:s3:::my-story-buddy-frontend/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": [
                "arn:aws:cloudfront::*:distribution/*"
            ]
        }
    ]
}
```

## Manual Deployment

If you need to deploy manually:

```bash
npm run build
aws s3 sync dist/ s3://my-story-buddy-frontend --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```
   VITE_API_URL=your_backend_api_url
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Build

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

## Environment Variables

- `VITE_API_URL`: The URL of your deployed backend API

## License

MIT
