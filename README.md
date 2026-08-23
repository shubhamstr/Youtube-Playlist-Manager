# 🎬 YouTube Playlist Manager

A modern, full-stack web application designed to browse, organize, and manage YouTube playlists with a sleek dark-themed interface inspired by YouTube's aesthetic.

---

## 🚀 Features

- **Modern Dark UI**: Deep black and slate tones (`#0F0F0F`) accented with YouTube signature red (`#FF0000`) and smooth glassmorphism effects.
- **Playlist Grid & Explorer**: Rich preview cards displaying thumbnails, video counts, privacy settings (Public/Unlisted/Private), tags, and last updated status.
- **Search & Filtering**: Real-time playlist filtering by keywords, categories, and privacy status.
- **Decoupled Architecture**:
  - **Client**: Next.js 14 App Router for fast, SSR-ready UI rendering.
  - **Server**: Express.js REST API with modular routing and CORS middleware.
- **Google OAuth Integration**: Built-in auth endpoint handlers prepared for YouTube Data API v3 integration.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Global & Scoped CSS Modules with Custom Variables)

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Middleware**: CORS, Dotenv
- **API Style**: RESTful JSON API

---

## 📂 Project Structure

```
youtube-playlist-manager/
├── client/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/            # App Router pages (login, dashboard, layout)
│   │   ├── components/     # UI Components (Header, Sidebar, PlaylistCard)
│   │   └── context/        # React Context (AuthContext)
│   ├── next.config.js
│   └── package.json
├── server/                 # Express Backend API
│   ├── src/
│   │   ├── routes/         # Express API Routes (auth, playlists)
│   │   └── index.js        # Server Entry Point
│   └── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

---

### 1️⃣ Server Setup (Backend)

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (optional for OAuth):

```env
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

Start the backend development server:

```bash
npm run dev
```
The server will run at **`http://localhost:5000`**.

---

### 2️⃣ Client Setup (Frontend)

In a new terminal window, navigate to the `client` directory and install dependencies:

```bash
cd client
npm install
```

Start the Next.js development server:

```bash
npm run dev
```
The client application will run at **`http://localhost:3000`**.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | API health check status |
| `GET` | `/api/auth/google/url` | Get Google OAuth 2.0 login URL |
| `GET` | `/api/auth/me` | Fetch current user session |
| `GET` | `/api/playlists` | Retrieve all playlists |
| `GET` | `/api/playlists/:id` | Fetch specific playlist details |

---

## 🔮 Roadmap & Upcoming Enhancements

- [ ] **YouTube Data API v3 Live Sync**: Fetch live user playlists & channel metadata.
- [ ] **Playlist Operations**: Create, rename, delete playlists, and reorder videos.
- [ ] **Batch Management**: Move/copy videos across multiple playlists in bulk.
- [ ] **Analytics**: Stats breakdown on total watch duration, top tags, and video counts.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
