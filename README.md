# Story App Backend API

This is the backend service for a story and blog management application, built with Node.js, Express.js, TypeScript, and MongoDB. It handles user authentication via Clerk and media storage using Cloudflare R2 (via the `fast-r2` custom NPM module).

## Features

* **User Management:** Basic user profiles linked to Clerk, with an `approvedStatus` field.
* **Group Management:** Create and manage groups, which act as containers for stories and blogs.
* **Story Management:** Create, update, delete, and fetch stories associated with groups, including media uploads to Cloudflare R2.
* **Blog Management:** Create, update, delete, and fetch blog posts associated with groups, including thumbnail image uploads to Cloudflare R2.
* **Authentication:** Secured using Clerk.
* **Public API Endpoints:** Dedicated endpoints to fetch all groups' stories or blogs without authentication.
* **Scalable Architecture:** Designed with controllers, services, models, and middleware for clear separation of concerns.

## Technologies Used

* Node.js (ES Modules)
* TypeScript
* Express.js
* MongoDB (Atlas) & Mongoose
* Clerk (Authentication)
* Cloudflare R2 (Object Storage)
* `fast-r2` (Custom NPM module for R2 integration)
* Joi/Zod (for validation - to be implemented)
* Helmet, CORS, Express Rate Limit (Security & Performance)

## Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* npm (Node Package Manager)
* MongoDB Atlas Account
* Clerk Account
* Cloudflare Account with R2 enabled
* Your `fast-r2` custom NPM module (either published or locally linked)

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/story-app-backend.git](https://github.com/your-username/story-app-backend.git)
cd story-app-backend