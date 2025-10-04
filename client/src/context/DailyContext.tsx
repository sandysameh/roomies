import React, { createContext, useContext } from "react";
import { DailyCall } from "@daily-co/daily-js";
import { useAuth } from "./AuthContext";
import { useCallConnection } from "../hooks/useCallConnection";
import { useMediaControls } from "../hooks/useMediaControls";
import { useParticipants } from "../hooks/useParticipants";
import { useVideoTracks } from "../hooks/useVideoTracks";
import { useDailyEvents } from "../hooks/useDailyEvents";

interface RealParticipant {
  id: string;
  name: string;
  email: string;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isOwner?: boolean;
  joinedAt: string;
}

interface DailyContextType {
  callObject: DailyCall | null;
  participants: RealParticipant[];
  localAudio: boolean;
  localVideo: boolean;
  audioToggling: boolean;
  videoToggling: boolean;
  isInCall: boolean;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  joinRoom: (roomUrl: string, roomName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  videoRefs: React.RefObject<Map<string, HTMLVideoElement>>;
}

const DailyContext = createContext<DailyContextType | undefined>(undefined);

export const DailyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const { participants, updateParticipants, clearParticipants } =
    useParticipants({
      userName: user?.name || user?.email || "You",
      userEmail: user?.email || "",
    });

  const {
    localVideoRef,
    videoRefs,
    updateVideoElement,
    clearVideoElement,
    clearAllVideoElements,
  } = useVideoTracks();

  const {
    callObject,
    isInCall,
    joinRoom: connectToRoom,
    leaveRoom: disconnectFromRoom,
  } = useCallConnection({
    userName: user?.name || user?.email || "User",
    onJoined: (call) => {
      updateParticipants(call);
      setupEventListeners(call);
      initializeMediaTracks(call);
    },
    onLeft: () => {
      clearParticipants();
      clearAllVideoElements();
    },
  });

  const {
    localAudio,
    localVideo,
    audioToggling,
    videoToggling,
    toggleAudio,
    toggleVideo,
    updateMediaStates,
  } = useMediaControls(callObject);

  const { setupEventListeners } = useDailyEvents({
    callObject,
    onParticipantUpdate: updateParticipants,
    onTrackStarted: (sessionId, track, call, isLocal) => {
      updateParticipants(call);
      updateVideoElement(sessionId, track, call, isLocal);
    },
    onTrackStopped: clearVideoElement,
    onLocalMediaUpdate: updateMediaStates,
  });

  const initializeMediaTracks = (call: DailyCall) => {
    setTimeout(() => {
      const participants = call.participants();
      Object.values(participants).forEach((participant: any) => {
        if (participant.tracks?.video?.track) {
          updateVideoElement(
            participant.session_id,
            participant.tracks.video.track,
            call,
            participant.local
          );
        }

        if (participant.tracks?.audio?.track && !participant.local) {
          const audioElement = new Audio();
          audioElement.srcObject = new MediaStream([
            participant.tracks.audio.track,
          ]);
          audioElement.autoplay = true;
          audioElement.volume = 1.0;
          audioElement.play().catch(console.error);
        }
      });
    }, 1000);
  };

  // Wrapper functions to match existing API
  const joinRoom = async (roomUrl: string, roomName: string) => {
    await connectToRoom(roomUrl, roomName);
  };

  const leaveRoom = async () => {
    await disconnectFromRoom();
  };

  const value: DailyContextType = {
    callObject,
    participants,
    localAudio,
    localVideo,
    audioToggling,
    videoToggling,
    isInCall,
    toggleAudio,
    toggleVideo,
    joinRoom,
    leaveRoom,
    localVideoRef,
    videoRefs,
  };

  return (
    <DailyContext.Provider value={value}>{children}</DailyContext.Provider>
  );
};

export const useDaily = () => {
  const context = useContext(DailyContext);
  if (context === undefined) {
    throw new Error("useDaily must be used within a DailyProvider");
  }
  return context;
};
