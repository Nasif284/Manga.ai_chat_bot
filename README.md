# Manga.ai — Full-Stack AI Chatbot

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Express-5.x-green.svg)](https://expressjs.com/)
[![Vite 7](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![Google Gen AI](https://img.shields.io/badge/Google%20Gen%20AI-Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-blueviolet.svg)](https://clerk.com/)

A full-stack AI chatbot application built with **React 19**, **Express 5**, **MongoDB**, **Clerk**, **Cloudinary**, and **Google Gemini (`gemini-2.5-flash`)**. Users can sign in, start multi-turn conversations, upload images for visual Q&A, receive streamed Markdown responses in real time, and revisit their past chats from the sidebar.

---

## 🔄 End-to-End Application Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as React Client (:5173)
    participant API as Express Server (:8000)
    participant Cloudinary as Cloudinary CDN
    participant Gemini as Google Gemini 2.5 Flash
    participant Mongo as MongoDB

    User->>Client: Selects an image in chat input
    Client->>Client: Shows local preview (URL.createObjectURL) & encodes Base64 (FileReader)
    Client->>API: POST /api/image (multipart/form-data)
    API->>Cloudinary: Uploads temp file & deletes local copy (fs.unlinkSync)
    API-->>Client: Returns Cloudinary { url, public_id }

    User->>Client: Submits prompt
    Client->>Gemini: chat.sendMessageStream([inlineData, text])
    loop Streaming Response
        Gemini-->>Client: Yields text chunk
        Client->>User: Renders live Markdown
    end

    Client->>API: PATCH /api/chat/:id (user prompt + AI answer + Cloudinary URL)
    API->>Mongo: Appends turn via $push & $each
    API-->>Client: 200 OK
    Client->>Client: Invalidates TanStack Query ['chats'] cache
```

---

## 📂 Project Structure

This repository is split into two folders, each with its own detailed README:

| Folder | Tech Stack | Documentation |
| :--- | :--- | :--- |
| **[`Client/`](./Client)** | React 19, Vite 7, TanStack Query v5, `@google/genai`, Clerk React, React Router v7 | **[Read Client README ➔](./Client/README.md)** |
| **[`Api/`](./Api)** | Node.js (ESM), Express 5, Mongoose 8, `@clerk/express`, Cloudinary, Multer | **[Read Backend README ➔](./Api/README.md)** |

---

## ⚡ Key Features & Technical Choices

* **Real-Time Response Streaming:** Uses `@google/genai`'s `sendMessageStream()` with an async `for await...of` loop to progressively render Markdown (`react-markdown`) and auto-scroll as chunks arrive.
* **Multimodal Image Support:** Converts user-selected images into Base64 (`FileReader`) for Gemini's multimodal input while uploading the file via Multer to Cloudinary (`POST /api/image`) so the permanent image URL can be stored in MongoDB. Users can also remove an uploaded image before sending (`DELETE /api/image/:id`).
* **Two-Collection MongoDB Design:** Separates lightweight sidebar history (`userChats` storing `{ chat_id, title }`) from full conversation threads (`chat` storing `{ role, text, image }` arrays) so loading the sidebar doesn't fetch every message of every chat.
* **Direct Array Appends in MongoDB:** Uses Mongoose `findByIdAndUpdate` with `$push: { chat: { $each: body } }` to append new messages without reading and rewriting the entire conversation document.
* **Server State Management with TanStack Query:** Caches chat history (`["userChats"]`) and individual conversations (`["chats", id]`), automatically updating the UI via `invalidateQueries` after mutations.
* **Authentication with Clerk:** Protects `/dashboard` and `/chat/:id` routes on the frontend via `DashboardLayout` and identifies users on the backend via `@clerk/express` (`clerkMiddleware()` and `getAuth(req)`).

---

## 🛠️ Quickstart

### Prerequisites
* **Node.js** v18+
* **MongoDB** URI (local or MongoDB Atlas)
* **Clerk** Publishable & Secret keys
* **Cloudinary** Cloud Name, API Key & Secret
* **Google Gemini** API Key

### 1. Start the Backend (`Api/`)
```bash
cd Api
npm install

# Copy the example env file and fill in your keys
cp .env.example .env

# Start development server on http://localhost:8000
npm run dev
```

### 2. Start the Frontend (`Client/`)
```bash
cd Client
npm install

# Copy the example env file and fill in your keys
cp .env.example .env

# Start Vite dev server on http://localhost:5173
npm run dev
```
