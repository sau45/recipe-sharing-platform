# 🍽️ Recipe Sharing Platform — RESTful API

A backend API for a recipe-sharing application built using **Node.js, Express, MongoDB, JWT Authentication, Multer, and Sharp**.  
This platform allows users to view public recipes and enables registered chefs to upload and manage their own recipes.

---

## 🚀 Features

### ✅ Public Features
- Fetch all recipes with pagination  
- Filter by:
  - Keyword (title, description)
  - Labels (tags)
  - Chef
  - Publication date (ASC/DESC)
- View single recipe details

### 🔒 Protected (Chef Only)
- Register as a chef  
- Login using JWT authentication  
- Create new recipe posts  
- Upload and process images (Sharp image optimization)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|----------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Multer | File uploads |
| Sharp | Image processing |
| BcryptJS | Password hashing |

---

## 📁 Folder Structure

