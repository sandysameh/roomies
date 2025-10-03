import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "antd";
import { roomsAPI } from "../services/api";

export const useRoomManagement = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateRoom = useCallback(
    async (values: { name: string }) => {
      setCreateLoading(true);
      try {
        const response = await roomsAPI.createRoom(values);
        if (response.success) {
          message.success("Room created successfully!");
          return { success: true };
        }
        return { success: false };
      } catch (error: any) {
        console.error("Error creating room:", error);
        message.error(error.response?.data?.error || "Failed to create room");
        return { success: false, error };
      } finally {
        setCreateLoading(false);
      }
    },
    [message]
  );

  const handleJoinRoom = useCallback(
    async (roomName: string) => {
      try {
        const roomResponse = await roomsAPI.getRoom(roomName);

        if (!roomResponse.success) {
          throw new Error("Failed to get room");
        }

        // Navigate to room - let VideoRoom component handle Daily call object lifecycle
        navigate(`/room/${roomName}`, {
          state: {
            roomData: roomResponse.room,
            token: roomResponse.token,
          },
        });

        message.success(`Joining room: ${roomName}`);
        return { success: true };
      } catch (error: any) {
        console.error("Error joining room:", error);
        message.error("Failed to join room");
        return { success: false, error };
      }
    },
    [navigate, message]
  );

  const handleRouteToRoom = useCallback(
    async (roomName: string) => {
      try {
        const roomResponse = await roomsAPI.getRoom(roomName);

        if (!roomResponse.success) {
          throw new Error("Failed to get room");
        }

        navigate(`/room/${roomName}`, {
          state: {
            roomData: roomResponse.room,
            token: roomResponse.token,
          },
        });

        message.success(`Joined room: ${roomName}`);
        return { success: true };
      } catch (error: any) {
        console.error("Error joining room:", error);
        message.error("Failed to join room");

        return { success: false, error };
      }
    },
    [navigate, message]
  );
  const handleDeleteRoom = useCallback(
    async (roomName: string) => {
      try {
        await roomsAPI.deleteRoom(roomName);
        message.success("Room deleted successfully");
        return { success: true };
      } catch (error: any) {
        message.error(error.response?.data?.error || "Failed to delete room");
        return { success: false, error };
      }
    },
    [message]
  );

  return {
    createLoading,
    handleCreateRoom,
    handleJoinRoom,
    handleRouteToRoom,
    handleDeleteRoom,
  };
};
