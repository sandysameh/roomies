import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Daily from "@daily-co/daily-js";
import { message } from "antd";
import { useAuth } from "../context/AuthContext";
import { roomsAPI } from "../services/api";

export const useRoomManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const callObjectRef = useRef<any>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateRoom = useCallback(async (values: { name: string }) => {
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
  }, []);

  const handleJoinRoom = useCallback(
    async (roomName: string) => {
      try {
        const joinResponse = await roomsAPI.joinRoom(roomName);
        console.log("Backend join response:", joinResponse);

        if (!joinResponse.success) {
          throw new Error("Failed to join room");
        }

        // Clean up any existing call object
        if (callObjectRef.current) {
          try {
            await callObjectRef.current.destroy();
          } catch (e) {
            console.warn("Error destroying existing call object:", e);
          }
          callObjectRef.current = null;
        }

        // Create Daily call object and join
        const call = Daily.createCallObject();
        callObjectRef.current = call;

        await call.join({
          url: joinResponse.room.url,
          token: localStorage.getItem("token") || "",
          userName: user?.name || user?.email || "User",
          startVideoOff: true, // Start with video off so user can control it
          startAudioOff: false, // Start with audio on
        });

        // Store call object globally so VideoRoom can access it
        (window as any).dailyCallObject = call;

        // Navigate to room with success
        navigate(`/room/${roomName}`, {
          state: {
            roomData: joinResponse.room,
            token: joinResponse.token,
          },
        });

        message.success(`Joined room: ${roomName}`);
        return { success: true };
      } catch (error: any) {
        console.error("Error joining room:", error);
        message.error("Failed to join room");

        // Clean up on error
        if (callObjectRef.current) {
          try {
            await callObjectRef.current.destroy();
          } catch (e) {
            console.warn("Error destroying call object after error:", e);
          }
          callObjectRef.current = null;
        }
        return { success: false, error };
      }
    },
    [user, navigate]
  );

  const handleDeleteRoom = useCallback(async (roomName: string) => {
    try {
      await roomsAPI.deleteRoom(roomName);
      return { success: true };
    } catch (error: any) {
      message.error(error.response?.data?.error || "Failed to delete room");
      return { success: false, error };
    }
  }, []);

  return {
    createLoading,
    handleCreateRoom,
    handleJoinRoom,
    handleDeleteRoom,
  };
};
