import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import Daily, { DailyCall, DailyParticipant } from "@daily-co/daily-js";
import { message } from "antd";
import { useAuth } from "./AuthContext";

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
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [participants, setParticipants] = useState<RealParticipant[]>([]);
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(false);
  const [audioToggling, setAudioToggling] = useState(false);
  const [videoToggling, setVideoToggling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const callObjectRef = useRef<DailyCall | null>(null);
  const isJoiningRef = useRef<boolean>(false); // Prevent double joins
  const cleanupHandledRef = useRef<boolean>(false); // Prevent double cleanup

  // Update participants from Daily.js
  const updateParticipants = useCallback(
    (call: DailyCall) => {
      const dailyParticipants = call.participants();

      const participantList: RealParticipant[] = Object.values(
        dailyParticipants
      ).map((p: DailyParticipant) => {
        const participantName = p.local
          ? user?.name || user?.email || "You"
          : p.user_name || p.user_id || "Unknown User";

        return {
          id: p.session_id,
          name: participantName,
          email: p.local ? user?.email || "" : p.user_id || "",
          isLocal: p.local,
          audioEnabled: p.audio,
          videoEnabled: p.video,
          isOwner: p.owner || false,
          joinedAt: new Date().toISOString(),
        };
      });

      setParticipants(participantList);
    },
    [user]
  );

  const updateVideoElement = useCallback(
    (sessionId: string, track: MediaStreamTrack, call: DailyCall) => {
      let isLocalParticipant = false;
      let participantName = "Unknown";

      if (call) {
        const dailyParticipants = call.participants();
        const dailyParticipant = Object.values(dailyParticipants).find(
          (p: DailyParticipant) => p.session_id === sessionId
        ) as DailyParticipant | undefined;

        if (dailyParticipant) {
          isLocalParticipant = dailyParticipant.local;
          participantName = dailyParticipant.local
            ? user?.name || user?.email || "You"
            : dailyParticipant.user_name ||
              dailyParticipant.user_id ||
              "Remote User";
        }
      }

      let videoElement;
      if (isLocalParticipant) {
        videoElement = localVideoRef.current;
      } else {
        videoElement = videoRefs.current.get(sessionId);
      }

      if (videoElement && track.kind === "video") {
        if (isLocalParticipant && call) {
          try {
            const localVideoStream = call.localVideo();
            if (localVideoStream) {
              videoElement.srcObject = localVideoStream as any;
            } else {
              const stream = new MediaStream([track]);
              videoElement.srcObject = stream;
            }
          } catch (error) {
            console.error("Error with localVideo(), using fallback:", error);
            const stream = new MediaStream([track]);
            videoElement.srcObject = stream;
          }
        } else {
          const stream = new MediaStream([track]);
          videoElement.srcObject = stream;
        }

        videoElement.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      } else if (
        isLocalParticipant &&
        !videoElement &&
        track.kind === "video"
      ) {
        setTimeout(() => {
          const retryVideoElement = localVideoRef.current;
          if (retryVideoElement) {
            const stream = new MediaStream([track]);
            retryVideoElement.srcObject = stream;
            retryVideoElement.play().catch(console.error);
          }
        }, 500);
      }
    },
    [user]
  );

  const setupDailyEventListeners = useCallback(
    (call: DailyCall) => {
      call.on("participant-joined", (event: any) => {
        updateParticipants(call);
      });

      call.on("participant-left", (event: any) => {
        updateParticipants(call);
      });

      call.on("participant-updated", (event: any) => {
        updateParticipants(call);

        if (event.participant.local) {
          setLocalAudio(event.participant.audio);
          setLocalVideo(event.participant.video);

          if (event.participant.video && localVideoRef.current) {
            setTimeout(() => {
              try {
                const localVideoStream = call.localVideo();
                if (localVideoStream && localVideoRef.current) {
                  localVideoRef.current.srcObject = localVideoStream as any;
                  localVideoRef.current.play().catch(console.error);
                }
              } catch (error) {
                console.error(
                  "Error applying video after participant update:",
                  error
                );
              }
            }, 200);
          }
        }
      });

      call.on("track-started", (event: any) => {
        if (event.track.kind === "audio" && !event.participant.local) {
          const audioElement = new Audio();
          audioElement.srcObject = new MediaStream([event.track]);
          audioElement.autoplay = true;
          audioElement.volume = 1.0;

          audioElement.play().catch((error) => {
            console.error("Error playing remote audio:", error);
          });
        }

        if (event.track.kind === "video") {
          updateParticipants(call);

          setTimeout(() => {
            updateVideoElement(event.participant.session_id, event.track, call);
          }, 100);
        }
      });

      call.on("track-stopped", (event: any) => {
        const videoElement = videoRefs.current.get(
          event.participant.session_id
        );
        if (videoElement) {
          videoElement.srcObject = null;
        }
      });

      call.on("joined-meeting", () => {
        setIsInCall(true);
        updateParticipants(call);

        const localParticipant = call.participants().local;
        if (localParticipant) {
          setLocalAudio(localParticipant.audio);
          setLocalVideo(localParticipant.video);
        }
      });

      call.on("left-meeting", () => {
        setParticipants([]);
        setIsInCall(false);
      });

      call.on("error", (event: any) => {
        console.error("Daily.js error:", event);
        message.error("Video call error occurred");
      });
    },
    [updateParticipants, updateVideoElement]
  );

  // Check media devices
  const checkMediaDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );

      return { videoDevices, audioDevices };
    } catch (error) {
      console.error("Error checking media devices:", error);
      return { videoDevices: [], audioDevices: [] };
    }
  }, []);

  // Join room
  const joinRoom = useCallback(
    async (roomUrl: string, roomName: string) => {
      if (!user) {
        return;
      }

      // Prevent double joining
      if (isJoiningRef.current) {
        return;
      }

      // Check if we're already in a call
      if (callObjectRef.current) {
        try {
          const meetingState = callObjectRef.current.meetingState();
          if (
            meetingState === "joined-meeting" ||
            meetingState === "joining-meeting"
          ) {
            return;
          }
        } catch (e) {
          console.error("Error checking meeting state:", e);
        }
      }

      isJoiningRef.current = true;

      try {
        // Check if there's already an instance and destroy it
        try {
          const existingInstance = Daily.getCallInstance();
          if (existingInstance) {
            try {
              const callState = existingInstance.meetingState();
              if (callState !== "left-meeting" && callState !== "error") {
                await existingInstance.leave();
              }
              await new Promise((resolve) => setTimeout(resolve, 500));
              await existingInstance.destroy();
            } catch (e) {
              console.error("Error destroying instance:", e);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (e) {
          // No existing instance
        }

        // Double-check no instance exists before creating
        try {
          const doubleCheck = Daily.getCallInstance();
          if (doubleCheck) {
            await doubleCheck.destroy().catch(console.error);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (e) {
          // No instance, which is good
        }

        // Create new Daily call object
        const newCallObject = Daily.createCallObject();

        // Join the room
        await newCallObject.join({
          url: roomUrl,
          token: localStorage.getItem("token") || "",
          userName: user?.name || user?.email || "User",
          startVideoOff: true,
          startAudioOff: false,
        });

        // Setup event listeners
        setupDailyEventListeners(newCallObject);
        setCallObject(newCallObject);
        callObjectRef.current = newCallObject;

        // Initialize media setup
        setTimeout(async () => {
          await checkMediaDevices();

          updateParticipants(newCallObject);

          const participants = newCallObject.participants();
          Object.values(participants).forEach((participant: any) => {
            if (participant.tracks?.video?.track) {
              updateVideoElement(
                participant.session_id,
                participant.tracks.video.track,
                newCallObject
              );
            }
          });

          Object.values(participants).forEach((participant: any) => {
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

        message.success(`Joined room: ${roomName}`);
        isJoiningRef.current = false;
      } catch (error: any) {
        console.error("Error joining room:", error);
        message.error("Failed to join room");
        isJoiningRef.current = false;

        // Get the current call object from state instead of closure
        const currentCallObject = callObjectRef.current;
        if (currentCallObject) {
          try {
            await currentCallObject.destroy();
          } catch (e) {
            console.warn("Error destroying call object after error:", e);
          }
          setCallObject(null);
          callObjectRef.current = null;
        }

        try {
          const existingInstance = Daily.getCallInstance();
          if (existingInstance) {
            try {
              await existingInstance.destroy();
            } catch (e) {
              console.warn("Error destroying remaining instance:", e);
            }
          }
        } catch (e) {
          console.warn("Error cleaning up remaining instances:", e);
        }

        throw error;
      }
    },
    [
      user,
      setupDailyEventListeners,
      updateParticipants,
      updateVideoElement,
      checkMediaDevices,
    ]
  );

  // Leave room
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

      videoRefs.current.clear();
      callObjectRef.current = null;
      setCallObject(null);
      setIsInCall(false);
      setParticipants([]);
      isJoiningRef.current = false;

      message.info("Left the room");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    if (audioToggling || !callObject) {
      return;
    }

    setAudioToggling(true);
    const newAudioState = !localAudio;

    try {
      await callObject.setLocalAudio(newAudioState as any);
      setLocalAudio(newAudioState);
      message.info(newAudioState ? "Microphone unmuted" : "Microphone muted");
    } catch (error: any) {
      console.error("Error toggling audio:", error);
      message.error(
        `Failed to ${newAudioState ? "unmute" : "mute"} microphone: ${
          error.message || error
        }`
      );
      setLocalAudio(!newAudioState);
    } finally {
      setTimeout(() => {
        setAudioToggling(false);
      }, 200);
    }
  }, [localAudio, audioToggling, callObject]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (videoToggling || !callObject) {
      return;
    }

    setVideoToggling(true);
    const newVideoState = !localVideo;

    try {
      if (newVideoState) {
        await callObject.setLocalVideo(true as any);

        try {
          await callObject.startCamera();
        } catch (startError) {
          console.error("startCamera() warning:", startError);
        }
      } else {
        await callObject.setLocalVideo(false as any);
      }

      setLocalVideo(newVideoState);

      setTimeout(() => {
        updateParticipants(callObject);

        if (newVideoState && localVideoRef.current) {
          try {
            const localVideoStream = callObject.localVideo();
            if (localVideoStream) {
              localVideoRef.current.srcObject = localVideoStream as any;
              localVideoRef.current.play().catch(console.error);
            }
          } catch (error) {
            console.error("Error applying video stream after toggle:", error);
          }
        }
      }, 500);

      message.info(newVideoState ? "Camera turned on" : "Camera turned off");
    } catch (error: any) {
      console.error("Error toggling video:", error);
      message.error(
        `Failed to ${newVideoState ? "enable" : "disable"} camera: ${
          error.message || error
        }`
      );
      setLocalVideo(!newVideoState);
    } finally {
      setTimeout(() => {
        setVideoToggling(false);
      }, 300);
    }
  }, [localVideo, videoToggling, callObject, updateParticipants]);

  // Cleanup on unmount - only when provider actually unmounts
  useEffect(() => {
    return () => {
      // Prevent cleanup from running multiple times
      if (cleanupHandledRef.current) {
        return;
      }

      cleanupHandledRef.current = true;

      // Cleanup the call object on unmount
      const currentCallObject = callObjectRef.current;
      if (currentCallObject) {
        try {
          currentCallObject.destroy().catch((e) => {
            console.error("Error destroying on unmount:", e);
          });
        } catch (e) {
          console.error("Error in cleanup:", e);
        }
      }

      isJoiningRef.current = false;
      callObjectRef.current = null;
    };
  }, []);

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
