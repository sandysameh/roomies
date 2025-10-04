# Roomies - Video Calling App

A full-stack video calling application built with React, Node.js, and Daily.js.

## Features

- Real-time video calling
- Audio/video controls
- Multi-participant rooms
- User authentication
- Responsive design

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

## Daily.js Video Integration

This project was built following the [Daily.js Custom Video App with React Hooks tutorial](https://www.daily.co/blog/custom-video-app-with-daily-react-hooks-part-one/), which provides a comprehensive guide to building custom video applications with React and the Daily.js API.

### Overview

Daily.js is a powerful WebRTC platform that provides APIs for building video and audio calling applications. Our application uses both the Daily.js REST API (for room management) and the Daily.js client library (for handling video calls in the browser).

---

## Consumed Daily.js REST API Endpoints

Our backend server consumes the following Daily.js REST API endpoints to manage rooms:

### 1. **GET /rooms** - List All Rooms

**Documentation**: [https://docs.daily.co/reference/rest-api/rooms/list-rooms](https://docs.daily.co/reference/rest-api/rooms/list-rooms)

**Purpose**: Retrieves a list of all available rooms in your Daily.js account.

**Usage in our app**: We use this endpoint to display all available rooms to the user on the dashboard, allowing them to see which rooms they can join.

**Example Response**:

```json
{
  "data": [
    {
      "id": "room-id-123",
      "name": "my-awesome-room",
      "config": {},
      "created_at": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### 2. **POST /rooms** - Create a New Room

**Documentation**: [https://docs.daily.co/reference/rest-api/rooms/create-room](https://docs.daily.co/reference/rest-api/rooms/create-room)

**Purpose**: Creates a new video call room with custom configuration.

**Usage in our app**: When a user clicks "Create Room" in the dashboard, we call this endpoint to create a new room with specific settings (like room name, privacy settings, etc.).

**Example Request**:

```json
{
  "name": "my-meeting-room",
  "privacy": "public",
  "properties": {
    "enable_chat": true,
    "enable_screenshare": true,
    "max_participants": 10
  }
}
```

**Example Response**:

```json
{
  "id": "room-id-456",
  "name": "my-meeting-room",
  "url": "https://yourapp.daily.co/my-meeting-room",
  "created_at": "2025-01-01T12:30:00.000Z"
}
```

---

### 3. **GET /rooms/:name** - Get Room Configuration

**Documentation**: [https://docs.daily.co/reference/rest-api/rooms/get-room-config](https://docs.daily.co/reference/rest-api/rooms/get-room-config)

**Purpose**: Retrieves detailed information about a specific room.

**Usage in our app**: Before joining a room, we fetch its configuration to verify the room exists and to get information like the room URL, privacy settings, and other properties.

**Example**: `GET /rooms/my-meeting-room`

**Example Response**:

```json
{
  "id": "room-id-456",
  "name": "my-meeting-room",
  "url": "https://yourapp.daily.co/my-meeting-room",
  "privacy": "public",
  "config": {
    "max_participants": 10,
    "enable_chat": true
  }
}
```

---

### 4. **DELETE /rooms/:name** - Delete a Room (Optional)

**Documentation**: [https://docs.daily.co/reference/rest-api/rooms/delete-room](https://docs.daily.co/reference/rest-api/rooms/delete-room)

**Purpose**: Permanently deletes a room from your Daily.js account.

**Usage in our app**: While not required for basic functionality, this endpoint can be used to clean up old or unused rooms. We haven't implemented this in the main UI, but it's available in the backend API if needed.

**Example**: `DELETE /rooms/my-old-room`

---

### 5. **GET /rooms/:name/presence** - Get Room Presence

**Documentation**: [https://docs.daily.co/reference/rest-api/rooms/get-room-presence](https://docs.daily.co/reference/rest-api/rooms/get-room-presence)

**Purpose**: Returns information about who is currently in a room.

**Usage in our app**: We use this endpoint to display the number of participants currently in a room before a user joins. This helps users see which rooms are active and how many people are already in a call.

**Example**: `GET /rooms/my-meeting-room/presence`

**Example Response**:

```json
{
  "total_count": 3,
  "participants": {
    "user-123": {
      "id": "user-123",
      "name": "John Doe",
      "joined_at": "2025-01-01T13:00:00.000Z"
    }
  }
}
```

**What this means for users**: If you see a room has 3 participants, you know there's an active conversation happening, and you can decide whether to join or create a new room.

---

## Daily.js Client Library Integration

While the REST API manages rooms on the server, the Daily.js client library handles the actual video call experience in the browser. Here's how we use it:

### Creating a Call Instance (Only Once!)

**Documentation**: [https://docs.daily.co/reference/daily-js/instance-methods/join](https://docs.daily.co/reference/daily-js/instance-methods/join)

**The Golden Rule**: We only create ONE Daily.js call instance per session using `getCallInstance()`.

**Why is this important?**
Think of the call instance like a phone connection. You don't open multiple phone lines for the same call - you establish one connection and use it for the entire conversation. Creating multiple instances would:

- Waste computer resources
- Cause confusing audio/video duplicates
- Lead to unpredictable behavior

**How we implement this**:

```typescript
// In our DailyContext.tsx
const getCallInstance = useCallback(() => {
  if (callObjectRef.current) {
    return callObjectRef.current; // Return existing instance
  }

  // Only create a new instance if one doesn't exist
  const newCallObject = DailyIframe.createCallObject();
  callObjectRef.current = newCallObject;
  return newCallObject;
}, []);
```

**What this code does (in simple terms)**:

1. First, check if we already have a "phone line" (call instance)
2. If yes, use the existing one
3. If no, create a new one and save it for future use
4. This ensures we NEVER create duplicate instances

---

### Joining a Room

**Documentation**: [https://docs.daily.co/reference/daily-js/instance-methods/join](https://docs.daily.co/reference/daily-js/instance-methods/join)

**What is "joining"?**
Joining a room is like entering a video conference. Once you join:

- Your camera and microphone become available to the room
- You can see and hear other participants
- Others can see and hear you (if your camera/mic are enabled)

**How we join a room**:

```typescript
const joinRoom = async (roomUrl: string) => {
  const callObject = getCallInstance(); // Get our single instance

  await callObject.join({
    url: roomUrl,
    userName: "Your Name",
    audioEnabled: true, // Start with mic on
    videoEnabled: false, // Start with camera off
  });
};
```

**Breaking this down**:

- `url`: The Daily.js room URL (e.g., "https://yourapp.daily.co/my-room")
- `userName`: Your display name that others will see
- `audioEnabled`: Whether your microphone starts on (`true`) or muted (`false`)
- `videoEnabled`: Whether your camera starts on (`true`) or off (`false`)

**What happens after joining**:

1. Daily.js connects you to the room
2. You receive information about other participants
3. Video/audio streams start flowing
4. Events start firing (like `participant-joined`, `track-started`, etc.)

---

### Leaving a Room

**Documentation**: [https://docs.daily.co/reference/daily-js/instance-methods/leave](https://docs.daily.co/reference/daily-js/instance-methods/leave)

**What is "leaving"?**
Leaving is like hanging up the phone. It:

- Disconnects you from the video call
- Stops your camera and microphone
- Removes you from other participants' views
- Cleans up video/audio resources

**How we leave a room**:

```typescript
const leaveRoom = async () => {
  const callObject = getCallInstance();

  if (callObject) {
    await callObject.leave();
    await callObject.destroy(); // Clean up completely
  }
};
```

**Breaking this down**:

- `leave()`: Disconnects from the current room
- `destroy()`: Completely cleans up the call instance (releases camera, mic, memory)

**Important Note**: After calling `destroy()`, you'll need to create a new call instance to join another room. That's why we clear our saved instance after destroying:

```typescript
callObjectRef.current = null; // Reset so we can create a new instance later
```

---

## Understanding Daily.js Events

**Documentation**: [https://docs.daily.co/reference/daily-js/events](https://docs.daily.co/reference/daily-js/events)

Events are like notifications that tell you when something happens in the video call. Think of them as your app's "eyes and ears" for the call.

### The `participant-updated` Event

This is one of the MOST IMPORTANT events you'll work with. It fires whenever ANYTHING changes about a participant.

**When does it fire?**

- Someone turns their camera on or off
- Someone mutes or unmutes their microphone
- Someone starts or stops screen sharing
- Someone's network quality changes
- Someone's name changes

**Why is this important?**
Your UI needs to react to these changes in real-time. If John mutes his mic, everyone should immediately see a "muted" icon next to his name.

**How we use it**:

```typescript
// In our useDailyEvents.ts
call.on("participant-updated", (event: any) => {
  const participant = event.participant;

  // If this is the local user (you)
  if (participant.local) {
    // Check if audio track is actually playing
    const audioEnabled = participant.tracks?.audio?.state === "playable";

    // Check if video track is actually playing
    const videoEnabled = participant.tracks?.video?.state === "playable";

    // Update our UI to show current mic/camera state
    updateMediaStates(audioEnabled, videoEnabled);
  }

  // Update the participant list for everyone
  onParticipantUpdate(call);
});
```

**Breaking this down**:

1. **`participant.local`**: This tells us if the update is about YOU or someone else

   - `true` = the update is about you (your camera, your mic)
   - `false` = the update is about another participant

2. **`participant.tracks?.audio?.state`**: This tells us the actual state of the audio track
   - `"playable"` = audio is on and working
   - `"off"` or `undefined` = audio is off/muted
3. **`participant.tracks?.video?.state`**: Same as audio, but for video

   - `"playable"` = camera is on and streaming
   - `"off"` or `undefined` = camera is off

4. **Why check `state === "playable"` instead of just checking if track exists?**
   - A track can exist but be paused/stopped/blocked
   - Checking `"playable"` ensures it's ACTUALLY working
   - This prevents showing a "camera on" icon when the camera is actually off

**Real-world example**:
Imagine you're in a call and you click the "mute" button:

1. Your app calls `callObject.setLocalAudio(false)`
2. Daily.js processes this and updates your audio state
3. Daily.js fires a `participant-updated` event
4. Our event listener catches it and sees `audio.state` is no longer `"playable"`
5. We update the UI to show a muted microphone icon
6. Everyone else in the call ALSO gets a `participant-updated` event
7. Their UIs update to show you're muted

This all happens in milliseconds, creating a real-time experience!

---

## Media Controls Deep Dive

Media controls allow users to turn their camera and microphone on and off during a call.

### Understanding Audio/Video State

**The Challenge**: We need to keep track of whether the user's mic and camera are on or off, and we need to keep our UI in sync with the actual state.

**Our Solution**: We maintain state variables and update them whenever the state changes:

```typescript
// In useMediaControls.ts
const [localAudio, setLocalAudio] = useState(true); // Mic starts ON
const [localVideo, setLocalVideo] = useState(false); // Camera starts OFF
```

**Why start with these values?**

- **Audio ON**: Most people want to speak immediately when joining
- **Video OFF**: Gives users privacy until they're ready to be seen

---

### Toggling Audio (Mute/Unmute)

**What happens when you click the microphone button?**

```typescript
const toggleAudio = async () => {
  // 1. Prevent clicking too fast (debouncing)
  if (audioToggling || !callObject) return;

  // 2. Set a "loading" state so button appears disabled
  setAudioToggling(true);

  // 3. Determine new state (if currently on, turn off; if off, turn on)
  const newAudioState = !localAudio;

  try {
    // 4. Tell Daily.js to actually change the audio state
    await callObject.setLocalAudio(newAudioState);

    // 5. Update our local state to match
    setLocalAudio(newAudioState);

    // 6. Show a friendly message to the user
    message.info(newAudioState ? "Microphone unmuted" : "Microphone muted");
  } catch (error) {
    // 7. If something goes wrong, show an error and revert state
    console.error("Error toggling audio:", error);
    message.error("Failed to toggle microphone");
    setLocalAudio(!newAudioState); // Revert to previous state
  } finally {
    // 8. Re-enable the button after a short delay
    setTimeout(() => setAudioToggling(false), 200);
  }
};
```

**Step-by-step explanation**:

1. **Prevent double-clicks**: If someone clicks the button twice very quickly, we ignore the second click
2. **Visual feedback**: Set `audioToggling = true` so we can show a loading spinner or disabled state
3. **Calculate new state**: If mic is currently on, we want to turn it off (and vice versa)
4. **Make the actual change**: `setLocalAudio()` tells Daily.js to mute/unmute your microphone
5. **Update UI state**: We update our React state so the button shows the correct icon
6. **User feedback**: Show a toast message confirming the action
7. **Error handling**: If something fails (no mic permission, hardware issue), we:
   - Log the error for debugging
   - Show an error message to the user
   - Revert our state back to what it was before
8. **Re-enable button**: After 200ms, allow the button to be clicked again

**Why is error handling so important?**

- User might revoke microphone permission mid-call
- Microphone hardware might fail
- Browser might block audio for policy reasons
- We need to handle these gracefully instead of breaking the app

---

### Toggling Video (Camera On/Off)

Video is more complex than audio because:

- Cameras need to be "started" before they can stream
- Camera permissions are more likely to be denied
- Video uses more resources, so failures are more common

```typescript
const toggleVideo = async () => {
  if (videoToggling || !callObject) return;

  setVideoToggling(true);
  const newVideoState = !localVideo;

  try {
    if (newVideoState) {
      // Turning camera ON requires two steps:

      // Step 1: Enable the video track
      await callObject.setLocalVideo(true);

      // Step 2: Start the camera hardware
      try {
        await callObject.startCamera();
      } catch (startError) {
        // startCamera() might fail if already started - that's okay
        console.error("startCamera() warning:", startError);
      }
    } else {
      // Turning camera OFF is simpler - just disable the track
      await callObject.setLocalVideo(false);
    }

    setLocalVideo(newVideoState);
    message.info(newVideoState ? "Camera turned on" : "Camera turned off");
  } catch (error) {
    console.error("Error toggling video:", error);
    message.error(`Failed to ${newVideoState ? "enable" : "disable"} camera`);
    setLocalVideo(!newVideoState);
  } finally {
    // Video needs slightly more time to stabilize
    setTimeout(() => setVideoToggling(false), 300);
  }
};
```

**Why is turning camera ON a two-step process?**

1. **`setLocalVideo(true)`**: This tells Daily.js "I want to send video"

   - Creates a video track in the call
   - Reserves bandwidth for video
   - Signals to other participants that video is coming

2. **`startCamera()`**: This actually powers on the camera hardware
   - Requests camera permission from the browser (if not already granted)
   - Initializes the camera hardware
   - Starts capturing video frames

**Why the extra try/catch around `startCamera()`?**

- If the camera is already running, `startCamera()` might throw an error
- This is actually fine - the camera is already on
- We catch and log it, but don't treat it as a failure

**Why longer timeout for video (300ms vs 200ms)?**

- Camera hardware takes longer to initialize than microphone
- Video frames need time to start flowing
- This prevents UI flickering or premature re-enables

---

### Synchronizing State with Events

Here's the critical connection: Our media controls need to stay in sync with Daily.js events.

**The problem**: State can change from multiple sources:

- User clicks the button in our UI
- Another participant mutes us (in some apps)
- Browser loses camera permission
- Hardware disconnects

**Our solution**: Update state from both directions:

```typescript
// Method 1: User clicks button → Update Daily.js → Update UI
toggleAudio() → callObject.setLocalAudio() → setLocalAudio()

// Method 2: Daily.js events → Update UI
participant-updated event → updateMediaStates() → setLocalAudio()
```

**The `updateMediaStates` function**:

```typescript
const updateMediaStates = (audio: boolean, video: boolean) => {
  setLocalAudio(audio);
  setLocalVideo(video);
};
```

This is called from our event listener whenever Daily.js tells us the state changed:

```typescript
call.on("participant-updated", (event) => {
  if (event.participant.local) {
    const audioEnabled = event.participant.tracks?.audio?.state === "playable";
    const videoEnabled = event.participant.tracks?.video?.state === "playable";

    // Update our media controls to match reality
    updateMediaStates(audioEnabled, videoEnabled);
  }
});
```

**Why is this bidirectional sync so important?**

- **Without it**: UI shows camera on, but camera is actually off → Confusion!
- **With it**: UI always reflects the true state → Users trust the interface

**Real-world example**:

1. User clicks "turn on camera"
2. Browser shows permission dialog
3. User clicks "Block"
4. Daily.js tries to turn on camera but fails
5. `participant-updated` fires with `video.state = "off"`
6. Our `updateMediaStates` sets `localVideo = false`
7. UI shows camera as off, matching reality
8. User sees error message explaining what happened

This creates a robust, predictable experience even when things go wrong!

---

## Project Structure

```
roomies/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json for scripts
└── README.md        # This file
```
