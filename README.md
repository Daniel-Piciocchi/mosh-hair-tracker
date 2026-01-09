# Mosh Hair Tracker

A hair loss treatment progress tracking web application. Customers create "snapshots" containing two photos (Front and Top view) captured via webcam. Doctors review these snapshots to measure treatment outcomes.

## Features

- **Snapshot Management**: Full CRUD operations for hair progress snapshots
- **Webcam Capture**: Take front and top view photos directly in the browser
- **Face Detection**: Real-time AI-powered face detection with position and lighting guidance (bonus feature)
- **Notes**: Add and edit notes on snapshots for tracking observations
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **Persistent Storage**: SQLite database for reliable data storage

## Tech Stack

### Frontend
- Vite 6.x
- React 19.x
- TypeScript 5.6+
- Tailwind CSS 4.x
- React Router 7.x
- react-webcam for camera capture
- MediaPipe BlazeFace for face detection

### Backend
- Node.js 22.x LTS
- Express 5.x
- TypeScript 5.6+
- better-sqlite3 11.x
- Zod 3.x for validation

## Prerequisites

- Node.js 22.x (see `.nvmrc`)
- npm 10.x+

## Getting Started

### 1. Install Node.js version

```bash
nvm use
```

### 2. Install dependencies

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 3. Start development servers

```bash
# Terminal 1: Start server (runs on port 3001)
cd server && npm run dev

# Terminal 2: Start client (runs on port 5173, proxies /api to :3001)
cd client && npm run dev
```

### 4. Open the application

Navigate to [http://localhost:5173](http://localhost:5173)

## Usage

### Creating a Snapshot

1. Click "New Snapshot" on the home page
2. Allow camera access when prompted
3. **Front View**: Position your face in the oval guide. The AI will provide feedback:
   - Green border = Ready to capture
   - Orange border = Adjust position (follow the on-screen guidance)
4. Click "Capture Photo" then "Use This Photo"
5. **Top View**: Tilt your head forward to show the top of your head
6. Review both photos and click "Save Snapshot"

### Viewing & Editing Snapshots

- Click any snapshot card to open the detail modal
- Click "Add notes" or "Edit" to add observations
- Delete snapshots from the card (trash icon) or modal

## Project Structure

```
mosh-hair-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── camera/     # Camera and face detection components
│   │   │   ├── snapshots/  # Snapshot card, list, modal components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── lib/            # Utility functions
│   │   └── test/           # Test setup
│   └── ...
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── routes/         # Express routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── db/             # Database connection & schema
│   │   ├── middleware/     # Express middleware
│   │   ├── validators/     # Zod validators
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── ...
└── ...
```

## Available Scripts

### Client

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run test        # Run tests (20 tests)
npm run test:watch  # Run tests in watch mode
npm run typecheck   # Type check with TypeScript
npm run lint        # Lint with ESLint
npm run lint:fix    # Fix ESLint issues
```

### Server

```bash
npm run dev         # Start development server with hot reload
npm run build       # Build for production
npm run start       # Start production server
npm run test        # Run tests (8 tests)
npm run test:watch  # Run tests in watch mode
npm run typecheck   # Type check with TypeScript
npm run lint        # Lint with ESLint
npm run lint:fix    # Fix ESLint issues
```

## API Endpoints

| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | `/api/snapshots`      | List all snapshots    |
| GET    | `/api/snapshots/:id`  | Get snapshot by ID    |
| POST   | `/api/snapshots`      | Create new snapshot   |
| PUT    | `/api/snapshots/:id`  | Update snapshot       |
| DELETE | `/api/snapshots/:id`  | Delete snapshot       |

### Request/Response Examples

#### Create Snapshot
```json
POST /api/snapshots
{
  "frontPhoto": "data:image/jpeg;base64,...",
  "topPhoto": "data:image/jpeg;base64,..."
}
```

#### Update Snapshot (notes)
```json
PUT /api/snapshots/:id
{
  "notes": "Week 4 - noticing improvement in crown area"
}
```

## Testing

```bash
# Run all tests
cd client && npm test
cd server && npm test

# Results: 28 total tests (20 client + 8 server)
```

## License

Private - Mosh Take-Home Challenge
