import express from "express";
import axios from "axios";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// In-memory room storage
const rooms = new Map();

// Daily.js API configuration
const DAILY_API_BASE = "https://api.daily.co/v1";

const callDailyAPI = async (endpoint, method = "GET", data = null) => {
  const DAILY_API_KEY = process.env.DAILY_API_KEY;
  console.log("DAILY_API_KEY", DAILY_API_KEY ? "LOADED" : "UNDEFINED");

  if (!DAILY_API_KEY) {
    throw new Error("DAILY_API_KEY is not configured");
  }

  try {
    const config = {
      method,
      url: `${DAILY_API_BASE}${endpoint}`,
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    if (data) {
      config.data = data;
    }

    console.log(`Making Daily API request: ${method} ${config.url}`);
    if (data) {
      console.log("Request data:", JSON.stringify(data, null, 2));
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Daily API Error for ${method} ${endpoint}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// Get all rooms with participant counts
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Get rooms from Daily.js API
    const dailyRooms = await callDailyAPI("/rooms");
    console.log("dailyRooms SANDY", dailyRooms);

    // Enhance with our stored room data and participant counts
    const roomsWithData = await Promise.all(
      dailyRooms.data.map(async (dailyRoom) => {
        const storedRoom = rooms.get(dailyRoom.name);

        // Get participant count from Daily API
        let participantCount = 0;
        try {
          const presence = await callDailyAPI(
            `/rooms/${dailyRoom.name}/presence`
          );
          participantCount = presence.total_count || 0;
        } catch (error) {
          console.warn(
            `Could not get participant count for room ${dailyRoom.name}`
          );
        }

        return {
          id: dailyRoom.id,
          name: dailyRoom.name,
          url: dailyRoom.url,
          participantCount,
          createdBy: storedRoom?.createdBy || "Unknown",
          createdAt: storedRoom?.createdAt || dailyRoom.created_at,
          config: dailyRoom.config,
        };
      })
    );

    res.json({
      success: true,
      rooms: roomsWithData,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Create a new room (admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const roomName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    // Check if room already exists
    if (rooms.has(roomName)) {
      return res
        .status(400)
        .json({ error: "Room with this name already exists" });
    }

    // Create room via Daily.js API
    const roomData = {
      name: roomName,
      properties: {
        enable_screenshare: true,
        enable_chat: true,
        start_video_off: false,
        start_audio_off: false,
        max_participants: 50,
      },
    };

    const dailyRoom = await callDailyAPI("/rooms", "POST", roomData);

    // Store room metadata
    const roomMetadata = {
      id: dailyRoom.id,
      name: dailyRoom.name,
      url: dailyRoom.url,
      createdBy: req.user.name,
      createdAt: new Date().toISOString(),
      createdById: req.user.id,
    };

    rooms.set(dailyRoom.name, roomMetadata);

    res.status(201).json({
      success: true,
      room: {
        ...roomMetadata,
        participantCount: 0,
      },
    });
  } catch (error) {
    console.error("Error creating room:", error);

    if (error.response?.status === 400) {
      res.status(400).json({ error: "Invalid room configuration" });
    } else if (error.response?.status === 409) {
      res.status(409).json({ error: "Room already exists" });
    } else {
      res.status(500).json({ error: "Failed to create room" });
    }
  }
});

// // Get room details and join token
router.get("/:roomName/join", authenticateToken, async (req, res) => {
  try {
    const { roomName } = req.params;
    console.log(`Attempting to join room: ${roomName}`);
    console.log(`User: ${req.user.name} (${req.user.email})`);

    // First check if room exists in our local storage
    let storedRoom = rooms.get(roomName);
    console.log(`Room in local storage:`, storedRoom ? "YES" : "NO");

    // If not in local storage, check if it exists in Daily.js
    if (!storedRoom) {
      try {
        console.log("Fetching rooms from Daily API...");
        const dailyRooms = await callDailyAPI("/rooms");
        console.log(`Found ${dailyRooms.data.length} rooms from Daily API`);

        const dailyRoom = dailyRooms.data.find(
          (room) => room.name === roomName
        );

        if (!dailyRoom) {
          console.log(`Room "${roomName}" not found in Daily API`);
          return res.status(404).json({ error: "Room not found" });
        }

        console.log(`Found room in Daily API:`, dailyRoom);

        // Create a stored room entry for this existing Daily room
        storedRoom = {
          id: dailyRoom.id,
          name: dailyRoom.name,
          url: dailyRoom.url,
          createdBy: dailyRoom.created_by || "Unknown",
          createdAt: dailyRoom.created_at,
        };

        // Store it for future use
        rooms.set(roomName, storedRoom);
        console.log(`Added existing Daily room "${roomName}" to local storage`);
      } catch (error) {
        console.error("Error checking Daily.js rooms:", error);
        console.error("Error details:", error.response?.data || error.message);
        return res.status(404).json({ error: "Room not found" });
      }
    }

    // For now, let's skip token creation and just return the room URL
    // This will allow us to test the Daily.js integration without authentication
    console.log("Returning room details without token for testing");
    console.log("Stored room:", storedRoom);

    res.json({
      success: true,
      room: storedRoom,
      token: null, // We'll add token creation back once basic integration works
    });
  } catch (error) {
    console.error("Error in join endpoint:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to get room access",
      details: error.message,
    });
  }
});

// Delete a room (admin only)
router.delete(
  "/:roomName",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { roomName } = req.params;

      // Delete from Daily.js
      await callDailyAPI(`/rooms/${roomName}`, "DELETE");

      // Remove from our storage
      rooms.delete(roomName);

      res.json({
        success: true,
        message: "Room deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting room:", error);

      if (error.response?.status === 404) {
        res.status(404).json({ error: "Room not found" });
      } else {
        res.status(500).json({ error: "Failed to delete room" });
      }
    }
  }
);

export default router;
