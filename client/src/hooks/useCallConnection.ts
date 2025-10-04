import { useState, useRef, useCallback } from "react";
import Daily, { DailyCall } from "@daily-co/daily-js";
import { message } from "antd";

interface UseCallConnectionOptions {
  onJoined?: (call: DailyCall) => void;
  onLeft?: () => void;
  userName?: string;
}

export const useCallConnection = (options: UseCallConnectionOptions = {}) => {
  const { onJoined, onLeft, userName = "User" } = options;

  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const callObjectRef = useRef<DailyCall | null>(null);
  const isJoiningRef = useRef(false);

  const joinRoom = useCallback(
    async (roomUrl: string, roomName: string) => {
      // Prevent double joining
      if (isJoiningRef.current || isJoining) {
        console.log("Already joining, skipping...");
        return;
      }

      // Check if already in call
      if (callObjectRef.current) {
        try {
          const meetingState = callObjectRef.current.meetingState();
          if (
            meetingState === "joined-meeting" ||
            meetingState === "joining-meeting"
          ) {
            console.log("Already in call, skipping...");
            return;
          }
        } catch (e) {
          console.error("Error checking meeting state:", e);
        }
      }

      isJoiningRef.current = true;
      setIsJoining(true);

      try {
        // Clean up any existing instances
        try {
          const existingInstance = Daily.getCallInstance();
          if (existingInstance) {
            const callState = existingInstance.meetingState();
            if (callState !== "left-meeting" && callState !== "error") {
              await existingInstance.leave();
            }
            await new Promise((resolve) => setTimeout(resolve, 300));
            await existingInstance.destroy();
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (e) {}

        // Create new call object
        const newCallObject = Daily.createCallObject();

        // Join the room
        await newCallObject.join({
          url: roomUrl,
          token: localStorage.getItem("token") || "",
          userName: userName,
          startVideoOff: true,
          startAudioOff: false,
        });

        setCallObject(newCallObject);
        callObjectRef.current = newCallObject;
        setIsInCall(true);

        message.success(`Joined room: ${roomName}`);

        // Callback for additional setup
        if (onJoined) {
          onJoined(newCallObject);
        }
      } catch (error: any) {
        console.error("Error joining room:", error);
        message.error("Failed to join room");

        // Cleanup on error
        const currentCallObject = callObjectRef.current;
        if (currentCallObject) {
          try {
            await currentCallObject.destroy();
          } catch (e) {
            console.warn("Error destroying call object after error:", e);
          }
        }
        setCallObject(null);
        callObjectRef.current = null;
        throw error;
      } finally {
        isJoiningRef.current = false;
        setIsJoining(false);
      }
    },
    [isJoining, userName, onJoined]
  );

  const leaveRoom = useCallback(async () => {
    try {
      const currentCallObject = callObjectRef.current;
      if (currentCallObject) {
        try {
          await currentCallObject.leave();
          await currentCallObject.destroy();
        } catch (leaveError) {
          console.error("Error leaving call:", leaveError);
        }
      }

      callObjectRef.current = null;
      setCallObject(null);
      setIsInCall(false);
      isJoiningRef.current = false;

      message.info("Left the room");

      if (onLeft) {
        onLeft();
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }, [onLeft]);

  return {
    callObject,
    isInCall,
    isJoining,
    joinRoom,
    leaveRoom,
  };
};
