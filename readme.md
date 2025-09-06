WasteWise Backend API ♻️
This repository contains the complete backend server for the WasteWise application, a smart guide for waste segregation and recycling in Navi Mumbai. This powerful API is built with Node.js, Express, and MongoDB, and it handles all data management, user authentication, and administrative functions for the app.

Live API URL: https://wastewise-backend-324u.onrender.com (Note: This is your live backend URL, feel free to share it!)

Features
Secure User Authentication: Full user registration and login system using JSON Web Tokens (JWT) for secure, stateless authentication. Passwords are never stored in plain text, thanks to bcryptjs hashing.

Role-Based Access Control: A robust system that distinguishes between regular users and administrators, with dedicated middleware to protect admin-only routes.

Production-Ready Email Verification: New user accounts require email verification. Emails are sent using Nodemailer with Gmail, ensuring users are legitimate.

Gamification Engine: Handles the logic for awarding points for scans, tracking user scores, and assigning badges based on performance milestones.

Community Reporting System: Allows users to submit reports of local waste issues. Includes image upload handling via Cloudinary.

Dynamic Content Management: Admins can create, edit, and delete articles and waste collection schedules, which are served to all users via the API.

Advanced Analytics API: A dedicated endpoint that performs MongoDB aggregation queries to generate key statistics for the admin dashboard, such as daily scans and category breakdowns.

Tech Stack
Runtime: Node.js

Framework: Express.js

Database: MongoDB with Mongoose ODM

Authentication: JSON Web Token (JWT), bcryptjs

Image Uploads: Cloudinary, Multer

Email: Nodemailer

Local Setup & Installation
To run this backend server locally, follow these steps:

Clone the repository:

git clone [https://github.com/your-username/WasteWise-backend.git](https://github.com/your-username/WasteWise-backend.git)
cd WasteWise-backend

Install dependencies:

npm install

Set up Environment Variables:
Create a .env file in the root directory and add the following variables with your own credentials:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_REGISTRATION_KEY=your_secret_admin_key

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Gmail Credentials for Nodemailer
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_16_digit_google_app_password

# Admin Email for Reports
ADMIN_EMAIL=your_admin_email_address

Seed the Database:
To populate your database with initial data (like disposal locations and schedules), run the seeder script. Run this only once.

npm run data:import

Start the server:

npm start

The API will now be running on http://localhost:5001.