# Roomies - Video Calling App

A full-stack video calling application built with React, Node.js, and Daily.js.

## Features

- 🎥 Real-time video calling
- 🎤 Audio/video controls
- 👥 Multi-participant rooms
- 🔐 User authentication
- 📱 Responsive design

## Tech Stack

- **Frontend**: React, TypeScript, Ant Design
- **Backend**: Node.js, Express
- **Video**: Daily.js
- **Authentication**: JWT

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Daily.js API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sandysameh/roomies.git
cd roomies
```

2. Install root dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Install server dependencies:
```bash
cd server
npm install
cd ..
```

### Environment Variables

1. **Server Environment** - Copy and configure:
```bash
cp server/.env.example server/.env
```
Then edit `server/.env` with your values:
- `DAILY_API_KEY`: Your Daily.js API key
- `JWT_SECRET`: A secure random string for JWT tokens
- `PORT`: Server port (default: 5000)
- `CLIENT_URL`: Frontend URL (default: http://localhost:3000)

2. **Client Environment** - Copy and configure:
```bash
cp client/.env.example client/.env
```
Then edit `client/.env` with your values:
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000/api)

### Getting Daily.js API Key

1. Go to [Daily.js Dashboard](https://dashboard.daily.co/)
2. Sign up or log in
3. Create a new project
4. Copy your API key from the project settings

### Running the Application

1. **Development Mode** (runs both client and server):
```bash
npm run dev
```

2. **Or run separately**:

Start the server:
```bash
cd server
npm start
```

Start the client:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
roomies/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json for scripts
└── README.md        # This file
```

## Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

**Server:**
- `DAILY_API_KEY`
- `JWT_SECRET`
- `PORT`
- `CLIENT_URL`

**Client:**
- `REACT_APP_API_URL`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
