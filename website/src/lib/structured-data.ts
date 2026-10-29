import { appName, author, siteUrl } from './shared';

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: appName,
  alternateName: 'Learn AWS for free with LocalStack',
  url: siteUrl,
  inLanguage: ['en', 'bn'],
  description:
    'Learn AWS for free: run S3, IAM, Lambda, API Gateway, DynamoDB, SQS, SNS, EventBridge, CloudWatch, Secrets Manager and Terraform locally with Docker Compose and LocalStack, with step-by-step tutorials and a hands-on learning plan.',
  author: { '@type': 'Person', name: author.name, url: author.site },
};

export const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: author.name,
  jobTitle: 'Backend Engineer',
  description: 'Backend engineer building microservices and AI-powered systems with Node.js, TypeScript, and Python.',
  url: `${siteUrl}/en/author/`,
  mainEntityOfPage: author.site,
  sameAs: [author.site, author.github, author.linkedin, author.x, author.medium],
  knowsAbout: ['AWS', 'LocalStack', 'Node.js', 'TypeScript', 'Python', 'Docker', 'PostgreSQL', 'Redis'],
};
