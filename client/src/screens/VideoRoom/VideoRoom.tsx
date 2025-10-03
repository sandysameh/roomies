import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Layout, message, Spin } from "antd";
import { useDaily } from "../../context/DailyContext";
import { roomsAPI } from "../../services/api";
import VideoRoomHeader from "./VideoRoomHeader";
import VideoGrid from "./VideoGrid";
import ParticipantsList from "./ParticipantsList";
import {
  VideoRoomLayout,
  VideoContent,
  LoadingContainer,
  LoadingText,
} from "./VideoRoom.styles";

const VideoRoom: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Use Daily context
  const {
    participants,
    localAudio,
    localVideo,
    audioToggling,
    videoToggling,
    toggleAudio,
    toggleVideo,
    joinRoom,
    leaveRoom,
    localVideoRef,
    videoRefs,
  } = useDaily();

  const [loading, setLoading] = useState(true);
  const hasSetupRef = useRef(false);

  // Setup room once when component mounts
  useEffect(() => {
    const setupRoom = async () => {
      if (!roomName) {
        console.error("Missing roomName");
        message.error("Missing room information");
        navigate("/dashboard");
        return;
      }

      // Prevent multiple setups
      if (hasSetupRef.current) {
        console.log("Setup already called, skipping...");
        return;
      }
      hasSetupRef.current = true;

      try {
        setLoading(true);

        // Get room data from navigation state or fetch it
        let roomData = location.state?.roomData;

        if (!roomData) {
          console.log("📡 No room data found, fetching from API...");
          try {
            const roomResponse = await roomsAPI.getRoom(roomName);
            if (!roomResponse.success) {
              throw new Error("Failed to get room data");
            }
            roomData = roomResponse.room;
          } catch (error) {
            console.error("Error fetching room data:", error);
            message.error("Failed to get room information");
            navigate("/dashboard");
            return;
          }
        }

        // Join the room using the Daily context
        await joinRoom(roomData.url, roomName);

        setLoading(false);
      } catch (error: any) {
        console.error("Error setting up room:", error);
        message.error("Failed to setup room");
        navigate("/dashboard");
      }
    };

    setupRoom();

    // Cleanup on unmount - reset the setup flag
    return () => {
      hasSetupRef.current = false;
    };
  }, [roomName]);

  const handleLeaveRoom = useCallback(async () => {
    await leaveRoom();
    navigate("/dashboard");
  }, [leaveRoom, navigate]);

  const handleToggleAudio = useCallback(async () => {
    await toggleAudio();
  }, [toggleAudio]);

  const handleToggleVideo = useCallback(async () => {
    await toggleVideo();
  }, [toggleVideo]);

  if (loading || participants.length === 0) {
    return (
      <LoadingContainer>
        <Spin size="large" />
        <LoadingText>Joining room...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <VideoRoomLayout>
      <VideoRoomHeader
        roomName={roomName}
        participantCount={participants.length}
        localAudio={localAudio}
        localVideo={localVideo}
        audioToggling={audioToggling}
        videoToggling={videoToggling}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onLeaveRoom={handleLeaveRoom}
      />

      <Layout>
        <VideoContent $participantCount={participants.length}>
          <VideoGrid
            participants={participants}
            localVideoRef={localVideoRef}
            videoRefs={videoRefs}
          />
        </VideoContent>

        <ParticipantsList participants={participants} />
      </Layout>
    </VideoRoomLayout>
  );
};

export default VideoRoom;
