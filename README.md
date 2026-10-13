# capstone-project-virtual-fashion-for-women

# 👗 Virtual Fashion for Women (VFW)

> Online Women's Fashion Store with **AI Recommendation** & **Virtual Try-On**

![Next.js](https://img.shields.io/badge/Frontend-Next.js-blue)
![.NET](https://img.shields.io/badge/Backend-.NET%208-purple)
![Docker](https://img.shields.io/badge/Deploy-Docker-blue)
![Azure](https://img.shields.io/badge/Backend-Azure%20ACR-informational)
![AWS](https://img.shields.io/badge/Frontend-AWS%20Amplify-orange)

---

## 📌 Project Overview

**Virtual Fashion for Women (VFW)** is a web-based platform designed to enhance the online shopping experience for women by integrating:

- 🤖 **AI-powered outfit recommendations**
- 👕 **Virtual Try-On using image or camera (AR)**
- 🛒 Full e-commerce flow: cart, order, payment, refund
- 💳 Online payment via **MoMo** and **VNPay**

The project aims to reduce uncertainty when buying clothes online and minimize return rates by allowing users to visualize outfits before purchasing.

---

## ✨ Key Features

### 👤 Customer Features
- User authentication & profile management
- AI chatbot for outfit recommendations
- Virtual try-on:
  - Try-on using uploaded image
  - AR try-on using camera
- Product browsing, search & wishlist
- Cart & checkout
- Online payment (MoMo, VNPay)
- Order tracking & refund request

### 🛠️ Admin / Staff Features
- Product & category management
- Sale campaign management
- Order & refund management
- Dashboard & statistics
- Notification & ticket chat system

---

## 🧠 AI & Virtual Try-On

- **AI Recommendation**:
  - Based on user characteristics (style, occasion, skin tone)
  - Implemented via AI Conversation module
- **Virtual Try-On**:
  - Single clothing try-on
  - Combined outfit try-on (top + bottom)
  - Camera-based AR try-on (requires 3D models)

---

## 🏗️ System Architecture

<img width="940" height="421" alt="image" src="https://github.com/user-attachments/assets/cd3fe4b5-a3c6-4a26-aa34-dcf03922e21d" />

---

## 🧩 Tech Stack

### Frontend
- Next.js
- TailwindCSS

### Backend
- .NET 8 Web API
- Entity Framework Core
- Redis (Caching)

### Database
- SQL Server

### DevOps
- Docker
- VPS
- GitHub Actions (CI/CD)

---

## 🚀 Getting Started

The project can be executed in two ways:
1. **Using Docker Compose (Recommended - Fast & consistent)**
2. **Manual Local Setup (Development & Debugging)**

---

### 📋 Prerequisites

| Tool | Recommended Version | Description |
| :--- | :--- | :--- |
| **Git** | Latest | Version control |
| **.NET SDK** | .NET 8.0 SDK | Backend development environment |
| **Node.js & npm** | Node.js 20+ (or Node.js 18+) | Frontend development environment |
| **SQL Server** | SQL Server 2019+ / SQL Express | Primary relational database |
| **Redis** | Redis 6.0+ (or run via Docker) | In-memory cache & Session/OTP store |
| **Docker & Docker Compose** | Docker Desktop (latest) | Required if running containerized |

---

### ⚙️ Environment Configuration

#### 1. Backend Configuration (`VirtualTryonWomenFashion/VirtualTryonWomenFashion.API`)

Create or update the configuration file `appsettings.Development.json` (or `appsettings.json`) located in `VirtualTryonWomenFashion/VirtualTryonWomenFashion.API/`:

- **Database & Redis Connection Strings:**
  ```json
  "ConnectionStrings": {
    "MyDbContext": "Data Source=localhost;Initial Catalog=VirtualTryonWomenFashion;Persist Security Info=True;User ID=sa;Password=YOUR_DATABASE_PASSWORD;Encrypt=False;TrustServerCertificate=True",
    "RedisCloud": "localhost:6379,abortConnect=False"
  }
  ```

- **Third-Party Services & API Keys:**
  - `CloudinarySettings`: Cloud image storage and asset management for clothing & user try-on uploads.
  - `Gemini`: AI chatbot for personalized fashion stylist consultation and try-on image validation.
  - `FitRoomSetting`: AI Virtual Try-On integration API.
  - `Pinecone`: Vector database for similarity search and outfit recommendations.
  - `MomoPayment` & `VnPayPayment`: Online payment gateways (MoMo & VNPay Sandbox).
  - `GHNSetttings`: Shipping fee calculation and automated order delivery creation (Giao Hàng Nhanh).
  - `MailSettings`: Gmail SMTP configuration for verification emails and order notifications.
  - `GoogleCredential` & `GoogleMap`: Google OAuth authentication and Google Maps location autocomplete.

#### 2. Frontend Configuration (`virtual-fashion-for-women-FE`)

Create an `.env` file in the `virtual-fashion-for-women-FE/` folder:
```env
JWT_SECRET=ThisIsASecretKeyForJWTOfCapstoneWomanFashionStylistWithVirtualTryOnAndRecommendation
API_URL=https://localhost:7105/api
NEXT_PUBLIC_SIGNALR_URL=https://localhost:7105
```

> **Note:** When running via Docker Compose, these environment variables are pre-configured in `docker-compose.yml`.

---

### 🐳 Option 1: Quick Start with Docker Compose (Recommended)

The repository provides a pre-configured `docker-compose.yml` comprising 3 containers: **vfw-redis**, **vfw-backend** (.NET 8), and **vfw-frontend** (Next.js 15).

#### Step 1: Prepare the SQL Server Database
- Ensure SQL Server is running on your host machine on the default port `1433`.
- Ensure the `VirtualTryonWomenFashion` database is created and initialized.
- Verify the SQL Server credentials in `docker-compose.yml` under `ConnectionStrings__MyDbContext` (default connects via `host.docker.internal,1433`):
  ```yaml
  ConnectionStrings__MyDbContext=Data Source=host.docker.internal,1433;Initial Catalog=VirtualTryonWomenFashion;User ID=sa;Password=12345;Encrypt=False;TrustServerCertificate=True
  ```

#### Step 2: Build and Run Containers
In the root directory of the project (`capstone-project-virtual-fashion-for-women`), execute:

```bash
docker compose up --build -d
```

#### Step 3: Manage Containers & View Logs
```bash
# Check status of running containers
docker compose ps

# View real-time logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
```

#### Step 4: Access the Application
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API (Swagger UI)**: [http://localhost:7105/swagger](http://localhost:7105/swagger)
- **Redis Cache**: Port `6379`

#### Stop the services:
```bash
docker compose down
```

---

### 💻 Option 2: Manual Local Setup (Development & Debugging)

Recommended when developing, debugging, or modifying code in an IDE (Visual Studio, VS Code, JetBrains Rider).

#### Step 1: Start SQL Server & Redis
1. Start your local SQL Server instance and ensure the database `VirtualTryonWomenFashion` is ready.
2. Start a Redis instance (quickest via Docker):
   ```bash
   docker run -d --name vfw-redis -p 6379:6379 redis:alpine
   ```

#### Step 2: Run Backend (.NET 8 Web API)
Open a terminal window and navigate to the API directory:

```bash
# 1. Navigate to the API folder
cd VirtualTryonWomenFashion/VirtualTryonWomenFashion.API

# 2. Restore dependencies
dotnet restore

# 3. Build the project
dotnet build

# 4. Run the API with HTTPS launch profile (port 7105)
dotnet run --launch-profile https
```

- **Swagger Documentation**: [https://localhost:7105/swagger](https://localhost:7105/swagger)
- **API Base URL**: `https://localhost:7105/api`

#### Step 3: Run Frontend (Next.js)
Open another terminal window and navigate to the frontend directory:

```bash
# 1. Navigate to frontend folder
cd virtual-fashion-for-women-FE

# 2. Install dependencies
npm install

# 3. Start Next.js development server
npm run dev
```

- **Client Web Application**: [http://localhost:3000](http://localhost:3000)

---

### 🌐 Service Port Mapping Summary

| Service | Local Environment | Docker Environment | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | `http://localhost:3000` | Next.js 15 Client Web App |
| **Backend API** | `https://localhost:7105` | `http://localhost:7105` | ASP.NET Core 8 Web API |
| **Swagger UI** | `https://localhost:7105/swagger` | `http://localhost:7105/swagger` | Interactive API documentation |
| **Redis** | `localhost:6379` | `localhost:6379` | Distributed in-memory cache |
| **SQL Server** | `localhost:1433` | `host.docker.internal:1433` | Primary relational database |

---

### 👥 System Roles & Permissions

- 🛍️ **Customer**: Browse & filter fashion items, chat with AI Stylist for personalized recommendations, try on clothes virtually (2D Image or Camera AR), place orders, and pay online via MoMo / VNPay.
- 👨‍💼 **Staff**: Manage orders, review and process return/refund requests, and provide customer support via the real-time chat ticket system.
- 👑 **Admin**: Full system management including product & category catalogs, sale campaigns, user accounts, and business revenue analytics dashboards.
