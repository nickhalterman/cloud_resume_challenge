# AWS Cloud Resume Challenge

A serverless portfolio project built for the AWS Cloud Resume Challenge.  
Deployed using S3, CloudFront, Route 53, Lambda, API Gateway, and DynamoDB with CI/CD via GitHub Actions.  
Demonstrates full-stack cloud development, infrastructure as code, and automation best practices.

## Phase 1: Static Website on S3

This is the first milestone of my **AWS Cloud Resume Challenge** — hosting my resume as a static website on **Amazon S3**.  
The goal for this phase was simple: get something live on the internet that I fully deployed myself using the AWS CLI.

## What I Built

In this phase, I used the **AWS Command Line Interface (CLI)** to provision and host a static website entirely from the terminal.

- Created a new **S3 bucket** with `aws s3api create-bucket`
- Synced local website files (`index.html`, `error.html`, `styles.css`, `script.js`) using `aws s3 sync`
- Enabled **static website hosting** via `aws s3 website`
- Applied a **public-read bucket policy** with `aws s3api put-bucket-policy`
- Verified successful deployment using the S3 **website endpoint**

**Result:**  
My website is publicly accessible over HTTP at:  
[`http://nick-cloud-resume-1762652576.s3-website-us-east-1.amazonaws.com`](http://nick-cloud-resume-1762652576.s3-website-us-east-1.amazonaws.com)

## Steps I Took

### 1. Create the S3 bucket
Used the AWS CLI to create a unique bucket with a timestamp for uniqueness:

```bash
REGION="us-east-1"
BUCKET="nick-cloud-resume-$(date +%s)"

aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"
```

> Note: For `us-east-1`, no `--create-bucket-configuration` flag is required.

### 2. Upload my site files
Uploaded the frontend files directly from the CLI:

```bash
SITE_DIR="./frontend"
aws s3 sync "$SITE_DIR" s3://$BUCKET --delete
```

This mirrors all local files from `frontend/` to S3, deleting any stale files.

### 3. Enable static website hosting
Enabled S3 static website hosting:

```bash
aws s3 website s3://$BUCKET/ --index-document index.html --error-document error.html
```

This tells S3 which file to serve as the homepage and what to display for errors.

### 4. Make the content publicly readable
Created a public-read bucket policy so the website could be accessed via browser:

```bash
cat > /tmp/policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET" --policy file:///tmp/policy.json
```

### 5. Verify the website
Checked that the website was successfully configured and accessible:

```bash
aws s3api get-bucket-website --bucket "$BUCKET"
```

Example endpoint:  
[`http://nick-cloud-resume-1762652576.s3-website-us-east-1.amazonaws.com`](http://nick-cloud-resume-1762652576.s3-website-us-east-1.amazonaws.com)

Visited the URL in a browser — `index.html` rendered successfully.

## What I Learned

| Topic | Key Takeaway |
|-------|---------------|
| **AWS CLI vs Console** | Running everything from the CLI made me understand what the Console automates behind the scenes. |
| **Bucket naming rules** | Bucket names must be unique, lowercase, and DNS-compliant — uppercase letters or spaces break it. |
| **Public access behavior** | S3 website endpoints require public `s3:GetObject` access for browsers to fetch content. |
| **Website endpoint limits** | S3 endpoints are HTTP-only; CloudFront adds HTTPS and CDN performance. |
| **Automation mindset** | Using the CLI prepares me for Terraform — the same AWS operations, just defined in code. |

## Journal Entry (2025-11-08)

> **What I attempted:**  
> Created an S3 static website using the AWS CLI and uploaded my files.

> **Issue:**  
> Encountered `InvalidBucketName` due to uppercase letters and incorrect variable use.

> **Fix:**  
> Renamed the bucket to a lowercase DNS-compliant name and corrected the CLI syntax.

> **Learning:**  
> Static website hosting on S3 only supports HTTP; CloudFront will handle HTTPS next.

> **Next Step:**  
> Set up CloudFront for HTTPS.
