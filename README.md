# TechWiz

A comprehensive e-commerce platform for electronics (mobiles, laptops, accessories), emphasizing performance, security, and user-friendly design.

[**Live Demo**](https://techwiz-s8jl.onrender.com/)

---

## Overview

TechWiz is built to provide a seamless online shopping experience, featuring:
- **Smooth user registration/login** with secure payment processing via Razorpay  
- **OTP verification** for added security during account creation or login  
- **Referral system** enabling users to invite friends and earn rewards  
- **Product addition**, product details, order tracking, and an **intuitive checkout**  
- **Detailed sales charts** for analyzing trends and performance  
- **Coupon system** for discount management, along with **order cancellation/refund** via user wallets  
- **Sales invoice download** for users and admins to track order details  
- **File uploads** using Multer and **email notifications** via Nodemailer  
- **Mobile-first design** optimized for all devices using CSS, Bootstrap, and EJS  
- **MongoDB** for product management, order tracking, and scalable data handling  

---

## Features

1. **User Registration & OTP Verification**  
   - Secure user authentication flow, integrating **Razorpay** for payment  
   - **OTP verification** to ensure only genuine users can create or access accounts

2. **Referral System**  
   - Users can share referral links with friends  
   - Referral bonuses or credits are added to user wallets upon successful sign-ups or orders

3. **Order Management**  
   - Track orders, order status updates, and manage refunds  
   - **Sales invoice download** for each order, providing a detailed record of purchased items

4. **Product Dashboard**  
   - Add, edit, and remove products (including images via **Multer**)  
   - Detailed product pages with images, descriptions, and pricing

5. **Coupons & Discounts**  
   - Create and manage coupon codes  
   - Apply discounts at checkout

6. **Sales Charts**  
   - Visualize daily, weekly, or monthly sales  
   - Insights into top-selling products and revenue trends

7. **Email Notifications**  
   - Automated emails with **Nodemailer** to confirm orders and account verifications

8. **Mobile-First UI**  
   - Responsive design using **CSS**, **Bootstrap**, and **EJS** to ensure a smooth experience on any device

---

## Tech Stack

| **Technology** | **Usage**                                         |
|---------------:|:--------------------------------------------------|
| **Node.js**    | Runtime environment for server-side logic         |
| **Express**    | Web framework for building RESTful APIs           |
| **MongoDB**    | Database for storing products, orders, referrals  |
| **EJS**        | Template engine for server-side rendering         |
| **HTML/CSS**   | Basic structure and styling                       |
| **Bootstrap**  | Responsive UI components                          |
| **Fetch**      | API requests from client-side                     |
| **Razorpay**   | Secure payment integration                        |
| **Multer**     | File uploads (product images)                     |
| **Nodemailer** | Sending email notifications (including OTP)       |

**Workflow**: MVC architecture  
**Integrations**: Razorpay, Multer, NodeMailer  

---

## Key Components

1. **User Authentication & Payment**  
   - Smooth login/signup flow  
   - **OTP verification** for new accounts and critical actions  
   - **Razorpay** integration for secure checkouts

2. **Referral Program**  
   - Generate referral links for users  
   - Automatic crediting of referral bonuses upon successful sign-up or purchase

3. **Order Management**  
   - Track order status, manage refunds, and provide invoice downloads  
   - Cancel or refund orders directly through user wallets

4. **Product Dashboard**  
   - Add/edit products with images via **Multer**  
   - Detailed product pages with images, descriptions, and pricing

5. **Coupons & Discounts**  
   - Manage coupon codes for promotional discounts  
   - Apply discounts at checkout

6. **Sales Charts & Invoices**  
   - Visualize daily, weekly, or monthly sales  
   - Generate **PDF invoices** for each order

---

## Screenshots (Optional)

| Home Page                | Product Page              | Admin Dashboard           |
|--------------------------|---------------------------|---------------------------|
| ![Home](./screenshots/home.png) | ![Product](./screenshots/product.png) | ![Admin](./screenshots/admin.png) |

---

## Getting Started

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/Adarshnm02/TechWiz.git
   cd TechWiz
