import axios from "axios";

const rooms = new Map();
const DAILY_API_BASE = "https://api.daily.co/v1";

const callDailyAPI = async (endpoint, method = "GET", data = null) => {
  const DAILY_API_KEY = process.env.DAILY_API_KEY;
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

export const roomsService = {
  async getAllRooms() {
    const dailyRooms = await callDailyAPI("/rooms");

    const roomsWithData = await Promise.all(
      dailyRooms.data.map(async (dailyRoom) => {
        const storedRoom = rooms.get(dailyRoom.name);

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
          createdAt: storedRoom?.createdAt || dailyRoom.created_at,
          config: dailyRoom.config,
        };
      })
    );

    return roomsWithData;
  },

  async createRoom(name) {
    if (!name || !name.trim()) {
      throw new Error("Room name is required");
    }

    const roomName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    if (rooms.has(roomName)) {
      const error = new Error("Room with this name already exists");
      error.status = 400;
      throw error;
    }

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

    const roomMetadata = {
      id: dailyRoom.id,
      name: dailyRoom.name,
      url: dailyRoom.url,
      createdAt: new Date().toISOString(),
    };

    rooms.set(dailyRoom.name, roomMetadata);

    return {
      ...roomMetadata,
      participantCount: 0,
    };
  },

  async getRoomForJoin(roomName, user) {
    let storedRoom = rooms.get(roomName);

    if (!storedRoom) {
      const dailyRooms = await callDailyAPI("/rooms");
      const dailyRoom = dailyRooms.data.find((room) => room.name === roomName);

      if (!dailyRoom) {
        const error = new Error("Room not found");
        error.status = 404;
        throw error;
      }

      storedRoom = {
        id: dailyRoom.id,
        name: dailyRoom.name,
        url: dailyRoom.url,
        createdAt: dailyRoom.created_at,
      };

      rooms.set(roomName, storedRoom);
    }

    return {
      room: storedRoom,
      token: null,
    };
  },

  async deleteRoom(roomName) {
    await callDailyAPI(`/rooms/${roomName}`, "DELETE");
    rooms.delete(roomName);

    return { message: "Room deleted successfully" };
  },
};
