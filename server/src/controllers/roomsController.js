import { roomsService } from "../services/roomsService.js";

export const roomsController = {
  async getAllRooms(_, res) {
    try {
      const roomsWithData = await roomsService.getAllRooms();
      res?.json({
        success: true,
        rooms: roomsWithData,
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  },

  async createRoom(req, res) {
    try {
      const { name } = req.body;
      const room = await roomsService.createRoom(name);
      res.status(201).json({
        success: true,
        room,
      });
    } catch (error) {
      console.error("Error creating room:", error);
      if (
        error.status === 400 ||
        error.message === "Room name is required" ||
        error.message === "Room with this name already exists"
      ) {
        res.status(400).json({ error: error.message });
      } else if (error.response?.status === 400) {
        res.status(400).json({ error: "Invalid room configuration" });
      } else if (error.response?.status === 409) {
        res.status(409).json({ error: "Room already exists" });
      } else {
        res.status(500).json({ error: "Failed to create room" });
      }
    }
  },

  async joinRoom(req, res) {
    try {
      const { roomName } = req.params;
      const result = await roomsService.getRoomForJoin(roomName, req.user);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error in join endpoint:", error);
      console.error("Error stack:", error.stack);

      if (error.status === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({
          error: "Failed to get room access",
          details: error.message,
        });
      }
    }
  },

  async deleteRoom(req, res) {
    try {
      const { roomName } = req.params;
      const result = await roomsService.deleteRoom(roomName);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error deleting room:", error);

      if (error.response?.status === 404) {
        res.status(404).json({ error: "Room not found" });
      } else {
        res.status(500).json({ error: "Failed to delete room" });
      }
    }
  },
};
