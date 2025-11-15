# AWS Cloud Resume Challenge

A serverless portfolio project built for the AWS Cloud Resume Challenge.  
Deployed using S3, CloudFront, Route 53, Lambda, API Gateway, and DynamoDB with CI/CD via GitHub Actions.  
Demonstrates full-stack cloud development, infrastructure as code, and automation best practices.

## Table of Contents

- [Overview](#aws-cloud-resume-challenge)
- [Phase 1 – Static Website on S3](#phase-1-static-website-on-s3)
- [Phase 2 – HTTPS, DNS, and CloudFront Distribution](#phase-2-https-dns-and-cloudfront-distribution)
- [Phase 3 – Vistor Counter with DynamoDB, Lambda, and API](#phase-3-vistor-counter-with-dynamodb-lambda-and-api)

## Phase 1: Static Website on S3

This is the first milestone of my **AWS Cloud Resume Challenge** — hosting my resume as a static website on **Amazon S3**.  
The goal for this phase was simple: get something live on the internet that I fully deployed myself using the AWS CLI.

### What I Built

In this phase, I used the **AWS Command Line Interface (CLI)** to provision and host a static website entirely from the terminal.

- Created a new **S3 bucket** with `aws s3api create-bucket`
- Synced local website files (`index.html`, `error.html`, `styles.css`, `script.js`) using `aws s3 sync`
- Enabled **static website hosting** via `aws s3 website`
- Applied a **public-read bucket policy** with `aws s3api put-bucket-policy`
- Verified successful deployment using the S3 **website endpoint**

**Result:**  
My website is publicly accessible over HTTP at:  
[`http://nick-cloud-resume-1762652576.s3-website-us-east-1.amazonaws.com`](http://nick-cloud-resume-1762652576.s3-website-us-east-1.amazonaws.com)

### Steps I Took

#### 1. Create the S3 bucket
Used the AWS CLI to create a unique bucket with a timestamp for uniqueness:

```bash
REGION="us-east-1"
BUCKET="nick-cloud-resume-$(date +%s)"

aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"
```

> Note: For `us-east-1`, no `--create-bucket-configuration` flag is required.

#### 2. Upload my site files
Uploaded the frontend files directly from the CLI:

```bash
SITE_DIR="./frontend"
aws s3 sync "$SITE_DIR" s3://$BUCKET --delete
```

This mirrors all local files from `frontend/` to S3, deleting any stale files.

#### 3. Enable static website hosting
Enabled S3 static website hosting:

```bash
aws s3 website s3://$BUCKET/ --index-document index.html --error-document error.html
```

This tells S3 which file to serve as the homepage and what to display for errors.

#### 4. Make the content publicly readable
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

#### 5. Verify the website
Checked that the website was successfully configured and accessible:

```bash
aws s3api get-bucket-website --bucket "$BUCKET"
```

Example endpoint:  
[`http://nick-cloud-resume-1762652576.s3-website-us-east-1.amazonaws.com`](http://nick-cloud-resume-1762652576.s3-website-us-east-1.amazonaws.com)

Visited the URL in a browser — `index.html` rendered successfully.

### What I Learned

| Topic | Key Takeaway |
|-------|---------------|
| **AWS CLI vs Console** | Running everything from the CLI made me understand what the Console automates behind the scenes. |
| **Bucket naming rules** | Bucket names must be unique, lowercase, and DNS-compliant — uppercase letters or spaces break it. |
| **Public access behavior** | S3 website endpoints require public `s3:GetObject` access for browsers to fetch content. |
| **Website endpoint limits** | S3 endpoints are HTTP-only; CloudFront adds HTTPS and CDN performance. |
| **Automation mindset** | Using the CLI prepares me for Terraform — the same AWS operations, just defined in code. |

### Journal Entry (2025-11-08)

**What I attempted:**  
Created an S3 static website using the AWS CLI and uploaded my files.

**Issue:**  
Encountered `InvalidBucketName` due to uppercase letters and incorrect variable use.

**Fix:**  
Renamed the bucket to a lowercase DNS-compliant name and corrected the CLI syntax.

**Learning:**  
Static website hosting on S3 only supports HTTP; CloudFront will handle HTTPS next.

**Next Step:**  
Set up CloudFront for HTTPS.

## Phase 2: HTTPS, DNS, and CloudFront Distribution

This is the second milestone of my AWS Cloud Resume Challenge - securing and distributing my S3-hosted website globally with **CloudFront, Route 53**, and **AWS Certificate Manager (ACM)**. The goal for this phase was to serve my resume securely over HTTPS using a custom domain name.

### What I Built

In this phrase, I configured a **CloudFront distribution** in front of my private S3 bucket, provisioned an **SSL/TLS certificate** with ACM, and mapped my **custom domain** through Route 53.

- Created a **CloudFront distribution** pointing to my S3 bucket as the origin
- Used **Origin Access Control (OAC)** to restrict access and keep the bucket private
- Updated the **bucket policy** to allow **s3:GetObject** only from the CloudFront distribuution ARN
- Requested a **SSL certiciate** in ACM and validated it via DNS
- Configured **Route 53** with an Alias **A Record** pointing to the CloudFront distribution
- Enforced HTTPS-only trafic and verfied SSL certificate deployment

#### Result

My resume website is now live, secure, and globally cached via CloudFront at [https://nickhalterman.com](https://nickhalterman.com)

### Steps I Took

1. Set up CloudFront

  - Opened the CloudFront Console and created a new distribution
  - Selected my S3 bucket as the origin
  - Enabled Origin Access Control (OAC) so CloudFront could fetch private content
  - Applied the automatically generated bucket policy provided my CloudFront
  - Set the Default Root Object to **index.html**
  - Enabled Redirect HTTP to HTTPS to enforce secure connections

2. Request an SSL certificate

  - Opened AWS Certificate Manager (ACM) in the same region as my CloudFront distribution (us-east-1)
  - Requested a public certificate (nickthalterman.com)
  - Used DNS validation (automatically handled via Route 53)
  - Waited for the certificate status to change to "Issued"

3. Connect custom domain

  - In CloudFront, added nickhalterman.com under Alternate Domain Names (CNAMEs)
  - Selected the newly issued certificate from ACM
  - Saved and redeployed the distribution

4. Update Route 53 DNS records

  - Opened Route 53 -> Hosted Zones -> nickhalterman.com
  - Created an A Record
  - Set it as an Alias Record pointing to the CloudFront distribution
  - Saved the record and waited for DNS propagation (about 10-15 minutes)

5. Verify deployment

  Once propagation completed, I confirmed:

  - HTTPS lock icon appeared in the browser
  - Root domain resolved correctly
  - Content was delivered from CloudFront edge locations

### What I Learned

| Topic | Key Takeaway |
|-------|---------------|
| **CloudFront OAC** | Provides secure access to private S3 buckets without making them public. |
| **Root domain configuration** | CloudFront supports root domains directly via Route 53 Alias records. |
| **SSL certificates via ACM** | Free, automatically renewable, and easy to validate through Route 53. |
| **DNS propagation** | Changes may take several minutes before HTTPS works globally. |
| **Performance boost** | CloudFront caches content worldwide, improving page-load speed. |

### Journal Entry (2025-11-11)

**What I attempted:**  
Configured CloudFront, ACM, and Route 53 through the AWS Console to serve my resume site securely from **nickhalterman.com**.

**Issue:**  
Encountered “Access Denied” errors until I applied the correct CloudFront OAC policy to the S3 bucket.

**Fix:**  
Added the policy generated by CloudFront and confirmed the OAC was properly linked.

**Learning:**  
Using the AWS Console helped me understand the relationships between CloudFront, ACM, and Route 53 for end-to-end HTTPS delivery.

**Next Step:**  
Build backend functionality with **Lambda**, **API Gateway**, and **DynamoDB** to implement a visitor counter.

## Phase 3: Visitor Counter with DynamoDB, Lambda, and API

This is the third milestone of my AWS Cloud Resume Challenge - building the backend visitor counter using **AWS Lambda, DynamoDB, and a public API endpoint**. The goal for this phase was to create serverless backend logic that tracks page views and returns the updated count to my frontend.

### What I Built

In this phase, I implemented a fully serverless backend pipeline:

- Created a **DynamoDB table** to store a single record containing the visitor count
- Wrote a **Lambda function** in Python that retrieves, increments and updates the count
- Enabled a **Lambda Function URL** so the frontend can call the function directly
- Added **JavaScript** to my site to fetch the updated count and display it live

#### Result

<<<<<<< HEAD
My website now shows a real-time vistor counter sourced directly from DynamoDB and updated every time the page loads.
=======
My website now shows a real-time visitor counter sourced directly from DynamoDB an dupdated every time the page loads.
>>>>>>> bd3af65 (Fix typos in README.md)

### Steps I Took

1. Create the DynamoDB table

  - Primary Key: ID (Number)
  - Item: {"ID": 0, "views": initial number}

  This simple schema allowed me to store and update a single counter value.

2. Build the Lambda function (Python)

  I wrote the Lambda function using **boto3** to:

  1. Get the current view count from DynamoDB
  2. Add +1
  3. Write the new value back to the table
  4. Return the updated count as the response

  I chose to keep both the "get" and "update" logic in one function for simplicity.

  After writing the code, I deployed the function and confirmed it returned data correctly.

3. Enable Lambda Function URL (API Endpoint)

  To allow my frontend to call the Lambda, I:

   - Enabled a **Function URL**
   - Set **CORS** to temporarily allow all orgins during testing
   - Verified that hitting the URL directly incremented the counter

   Once it worked as expected, the CORS access became restricted only to my domain.

4. Connect frontend with JavaScript

  In index.js I added:

  - A fetch() call to the Lambda Function URL
  - Logic to update an HTML element with a returned view count
  - A fallback message ("Couldn't read views") for error handling

  Then I created a matching span in my index.html to display the value.

  Once everything was connected, refreshing the site incremented the counter in real time.

### What I Learned

| Topic | Key Takeaway |
|-------|---------------|
| **Lambda + DynamoDB workflow** | A single small Lambda function can read and update database items instantly. |
| **Understanding Function URLs** | Function URLs simplify API access without needing API Gateway for basic use cases. |
| **CORS behavior** | If CORS isn't configured correctly, the browser cannot read the response even if the API works. |
| **Frontend-backend integration** | A few lines of JavaScript can connect static sites to serverless APIs seamlessly. |
| **Atomic updates** | Even without transactions, DynamoDB handles simple counter updates efficiently. |

### Journal Entry (2025-11-14)

**What I attempted:**  
Built the backend visitor counter using DynamoDB, Lambda, and a Function URL so my resume site could display real-time views.

**Issue:**  
At first the website couldn't read the counter and showed “Couldn’t read views” due to missing CORS configuration.

**Fix:**  
Enabled CORS on the Lambda Function URL and redeployed the function. Once the frontend pointed to the correct URL, the counter updated properly.

**Learning:**  
This phase helped me understand how serverless APIs work behind the scenes and how Lambda interacts with DynamoDB using **boto3**.

**Next Step:**  
Begin writing backend tests, convert this setup to Infrastructure as Code, and configure CI/CD for automated deployment.
  
