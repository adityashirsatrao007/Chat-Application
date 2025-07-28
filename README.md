# Chat Application

A full-stack real-time chat app using Node.js, Express, Socket.IO, MongoDB, Clerk.dev, and Render hosting.

## Features

- Clerk.dev authentication
- Unique display names
- Multiple chat rooms
- Real-time messaging
- Message formatting (bold, italic, links)
- Responsive UI
- Notifications

## Setup (Local)

1. Clone repo & install dependencies:
   ```sh
   npm install
   ```
2. Add a `.env` file with your keys (see example in repo).
3. Start server:
   ```sh
   npm start
   ```
4. Open `http://localhost:10000` in your browser.

## Deploy on Render

- Add all ENV variables in Render dashboard.
- Set build/start command: `npm start`
- Set port: `10000`
- Add `render.yaml` for auto-deploy.

## ENV Example

```
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
VITE_CLERK_PUBLISHABLE_KEY=...
MONGODB_URI=...
CLIENT_URL=...
NODE_ENV=production
PORT=10000
```
