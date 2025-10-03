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
      console.log("Raw Daily participants:", dailyParticipants);

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

      console.log("Updated participants:", participantList);
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

      console.log("📍 Participant info:", {
        sessionId,
        isLocal: isLocalParticipant,
        name: participantName,
      });

      let videoElement;
      if (isLocalParticipant) {
        videoElement = localVideoRef.current;
        console.log("🏠 Using LOCAL video element:", videoElement);
      } else {
        videoElement = videoRefs.current.get(sessionId);
        console.log("🌐 Using REMOTE video element:", videoElement);
      }

      if (videoElement && track.kind === "video") {
        console.log("✅ Video element found, setting up stream...");

        if (isLocalParticipant && call) {
          try {
            const localVideoStream = call.localVideo();
            if (localVideoStream) {
              console.log(
                "🎯 Using Daily.js localVideo() method for local participant"
              );
              videoElement.srcObject = localVideoStream as any;
            } else {
              console.log("🔄 Fallback to MediaStream for local participant");
              const stream = new MediaStream([track]);
              videoElement.srcObject = stream;
            }
          } catch (error) {
            console.warn("⚠️ Error with localVideo(), using fallback:", error);
            const stream = new MediaStream([track]);
            videoElement.srcObject = stream;
          }
        } else {
          const stream = new MediaStream([track]);
          videoElement.srcObject = stream;
        }

        videoElement.onloadeddata = () => {
          console.log(
            "📺 Video data loaded for:",
            participantName,
            isLocalParticipant ? "(LOCAL)" : "(REMOTE)"
          );
        };

        videoElement.oncanplay = () => {
          console.log("▶️ Video can play for:", participantName);
        };

        videoElement.play().catch((error) => {
          console.error("❌ Error playing video:", error);
        });

        console.log(
          "🎬 Video element updated successfully for:",
          participantName,
          isLocalParticipant ? "(LOCAL)" : "(REMOTE)"
        );
      } else {
        console.warn("⚠️ Video element not found or not video track:", {
          videoElement: !!videoElement,
          trackKind: track.kind,
          sessionId,
          isLocal: isLocalParticipant,
          participantName,
        });

        if (isLocalParticipant && !videoElement && track.kind === "video") {
          console.log("🔄 Retrying to find local video element...");
          setTimeout(() => {
            const retryVideoElement = localVideoRef.current;
            if (retryVideoElement) {
              console.log("✅ Found local video element on retry");
              const stream = new MediaStream([track]);
              retryVideoElement.srcObject = stream;
              retryVideoElement.play().catch(console.error);
            }
          }, 500);
        }
      }
    },
    [user]
  );

  // Setup Daily event listeners
  const setupDailyEventListeners = useCallback(
    (call: DailyCall) => {
      call.on("participant-joined", (event: any) => {
        console.log("Participant joined:", event.participant);
        updateParticipants(call);
      });

      call.on("participant-left", (event: any) => {
        console.log("Participant left:", event.participant);
        updateParticipants(call);
      });

      call.on("participant-updated", (event: any) => {
        console.log("Participant updated:", event.participant);
        updateParticipants(call);

        if (event.participant.local) {
          setLocalAudio(event.participant.audio);
          setLocalVideo(event.participant.video);

          if (event.participant.video && localVideoRef.current) {
            setTimeout(() => {
              try {
                const localVideoStream = call.localVideo();
                if (localVideoStream && localVideoRef.current) {
                  console.log(
                    "🎯 Applying video stream after participant update"
                  );
                  localVideoRef.current.srcObject = localVideoStream as any;
                  localVideoRef.current.play().catch(console.error);
                }
              } catch (error) {
                console.warn(
                  "⚠️ Error applying video after participant update:",
                  error
                );
              }
            }, 200);
          }
        }
      });

      call.on("track-started", (event: any) => {
        console.log("🚀 Track started event:", event);
        console.log("🔍 Track details:", {
          sessionId: event.participant.session_id,
          trackKind: event.track.kind,
          isLocal: event.participant.local,
          participantName: event.participant.user_name,
          trackId: event.track.id,
          trackLabel: event.track.label,
        });

        if (event.track.kind === "audio" && !event.participant.local) {
          console.log(
            "🔊 Setting up remote audio for:",
            event.participant.user_name
          );

          const audioElement = new Audio();
          audioElement.srcObject = new MediaStream([event.track]);
          audioElement.autoplay = true;
          audioElement.volume = 1.0;

          audioElement.play().catch((error) => {
            console.error("❌ Error playing remote audio:", error);
          });

          console.log(
            "✅ Remote audio setup complete for:",
            event.participant.user_name
          );
        }

        if (event.track.kind === "video") {
          updateParticipants(call);

          setTimeout(() => {
            updateVideoElement(event.participant.session_id, event.track, call);
          }, 100);
        }
      });

      call.on("track-stopped", (event: any) => {
        console.log("Track stopped:", event);
        const videoElement = videoRefs.current.get(
          event.participant.session_id
        );
        if (videoElement) {
          videoElement.srcObject = null;
        }
      });

      call.on("joined-meeting", (event: any) => {
        console.log("Joined meeting:", event);
        setIsInCall(true);
        updateParticipants(call);

        const localParticipant = call.participants().local;
        if (localParticipant) {
          setLocalAudio(localParticipant.audio);
          setLocalVideo(localParticipant.video);
          console.log(
            "Initial local states - audio:",
            localParticipant.audio,
            "video:",
            localParticipant.video
          );
        }
      });

      call.on("left-meeting", (event: any) => {
        console.log("Left meeting:", event);
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

      console.log("🎥 Available cameras:", videoDevices.length);
      console.log("🎤 Available microphones:", audioDevices.length);

      videoDevices.forEach((device, index) => {
        console.log(
          `📹 Camera ${index + 1}:`,
          device.label || `Camera ${index + 1}`
        );
      });

      audioDevices.forEach((device, index) => {
        console.log(
          `🎤 Microphone ${index + 1}:`,
          device.label || `Microphone ${index + 1}`
        );
      });

      return { videoDevices, audioDevices };
    } catch (error) {
      console.error("❌ Error checking media devices:", error);
      return { videoDevices: [], audioDevices: [] };
    }
  }, []);

  // Join room
  const joinRoom = useCallback(
    async (roomUrl: string, roomName: string) => {
      if (!user) {
        console.log("No user, cannot join room");
        return;
      }

      // Prevent double joining
      if (isJoiningRef.current) {
        console.log("⚠️ Already joining a room, ignoring duplicate request");
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
            console.log(
              "Already in a call, skipping join. Meeting state:",
              meetingState
            );
            return;
          }
        } catch (e) {
          console.log("Error checking meeting state:", e);
        }
      }

      isJoiningRef.current = true;
      console.log("Starting room join process...");

      try {
        console.log("🚀 Setting up Daily.js for room:", roomName);

        // Check if there's already an instance and destroy it
        try {
          const existingInstance = Daily.getCallInstance();
          if (existingInstance) {
            console.log(
              "⚠️ Found existing call object instance, destroying it..."
            );
            try {
              const callState = existingInstance.meetingState();
              if (callState !== "left-meeting" && callState !== "error") {
                console.log("🚪 Leaving existing call before destroying...");
                await existingInstance.leave();
              }
              await new Promise((resolve) => setTimeout(resolve, 500));
              await existingInstance.destroy();
            } catch (e) {
              console.warn("Error destroying instance:", e);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (e) {
          console.log("No existing call instance found, proceeding...");
        }

        // Double-check no instance exists before creating
        try {
          const doubleCheck = Daily.getCallInstance();
          if (doubleCheck) {
            console.warn(
              "⚠️ Instance still exists after cleanup, force destroying..."
            );
            await doubleCheck.destroy().catch(console.error);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (e) {
          // No instance, which is good
        }

        // Create new Daily call object
        console.log("🚀 Creating new Daily call object...");
        const newCallObject = Daily.createCallObject();
        console.log("✅ Successfully created new Daily call object");

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
          console.log("🔧 Initializing media setup...");

          await checkMediaDevices();

          try {
            const micPermission = await navigator.permissions.query({
              name: "microphone" as PermissionName,
            });
            console.log("🎤 Microphone permission:", micPermission.state);
          } catch (e) {
            console.log("🎤 Could not check microphone permission");
          }

          try {
            const cameraPermission = await navigator.permissions.query({
              name: "camera" as PermissionName,
            });
            console.log("📹 Camera permission:", cameraPermission.state);
          } catch (e) {
            console.log("📹 Could not check camera permission");
          }

          updateParticipants(newCallObject);

          const participants = newCallObject.participants();
          Object.values(participants).forEach((participant: any) => {
            if (participant.tracks?.video?.track) {
              console.log(
                "Found existing video track for:",
                participant.session_id
              );
              updateVideoElement(
                participant.session_id,
                participant.tracks.video.track,
                newCallObject
              );
            }
          });

          Object.values(participants).forEach((participant: any) => {
            if (participant.tracks?.audio?.track && !participant.local) {
              console.log(
                "🔊 Setting up existing audio for:",
                participant.user_name
              );
              const audioElement = new Audio();
              audioElement.srcObject = new MediaStream([
                participant.tracks.audio.track,
              ]);
              audioElement.autoplay = true;
              audioElement.volume = 1.0;
              audioElement.play().catch(console.error);
            }
          });

          console.log("✅ Media setup complete");
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
        console.log("Leaving Daily call...");
        try {
          await currentCallObject.leave();
          // Destroy the call object after leaving
          await currentCallObject.destroy();
        } catch (leaveError) {
          console.warn("Error leaving call:", leaveError);
        }
      }

      // Clear refs and state
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
      console.log(
        "⚠️ Audio toggle blocked - toggling:",
        audioToggling,
        "callObject:",
        !!callObject
      );
      return;
    }

    setAudioToggling(true);
    const newAudioState = !localAudio;

    try {
      console.log("🎤 Toggling audio from", localAudio, "to", newAudioState);

      await callObject.setLocalAudio(newAudioState as any);
      console.log("✅ Daily.js setLocalAudio completed");

      setLocalAudio(newAudioState);

      message.info(newAudioState ? "Microphone unmuted" : "Microphone muted");
    } catch (error: any) {
      console.error("❌ Error toggling audio:", error);
      message.error(
        `Failed to ${newAudioState ? "unmute" : "mute"} microphone: ${
          error.message || error
        }`
      );

      setLocalAudio(!newAudioState);
    } finally {
      setTimeout(() => {
        setAudioToggling(false);
        console.log("🔓 Audio toggle unlocked");
      }, 200);
    }
  }, [localAudio, audioToggling, callObject]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (videoToggling || !callObject) {
      console.log(
        "⚠️ Video toggle blocked - toggling:",
        videoToggling,
        "callObject:",
        !!callObject
      );
      return;
    }

    setVideoToggling(true);
    const newVideoState = !localVideo;

    try {
      console.log("🎥 Toggling video from", localVideo, "to", newVideoState);

      if (newVideoState) {
        console.log("📹 Turning ON camera...");

        await callObject.setLocalVideo(true as any);
        console.log("✅ Daily.js setLocalVideo(true) completed");

        try {
          await callObject.startCamera();
          console.log("📹 Daily.js startCamera() completed");
        } catch (startError) {
          console.warn("⚠️ startCamera() warning (may be normal):", startError);
        }
      } else {
        console.log("📹 Turning OFF camera...");
        await callObject.setLocalVideo(false as any);
        console.log("✅ Daily.js setLocalVideo(false) completed");
      }

      setLocalVideo(newVideoState);

      setTimeout(() => {
        updateParticipants(callObject);

        if (newVideoState && localVideoRef.current) {
          try {
            const localVideoStream = callObject.localVideo();
            if (localVideoStream) {
              console.log(
                "🎯 Applying local video stream to element after toggle"
              );
              localVideoRef.current.srcObject = localVideoStream as any;
              localVideoRef.current.play().catch(console.error);
            }
          } catch (error) {
            console.warn("⚠️ Error applying video stream after toggle:", error);
          }
        }
      }, 500);

      message.info(newVideoState ? "Camera turned on" : "Camera turned off");
    } catch (error: any) {
      console.error("❌ Error toggling video:", error);
      message.error(
        `Failed to ${newVideoState ? "enable" : "disable"} camera: ${
          error.message || error
        }`
      );

      setLocalVideo(!newVideoState);
    } finally {
      setTimeout(() => {
        setVideoToggling(false);
        console.log("🔓 Video toggle unlocked");
      }, 300);
    }
  }, [localVideo, videoToggling, callObject, updateParticipants]);

  // Cleanup on unmount - only when provider actually unmounts
  useEffect(() => {
    console.log("DailyProvider mounted");

    return () => {
      console.log("DailyProvider cleanup running...");

      // Prevent cleanup from running multiple times
      if (cleanupHandledRef.current) {
        console.log("Cleanup already handled, skipping...");
        return;
      }

      cleanupHandledRef.current = true;

      // Cleanup the call object on unmount
      const currentCallObject = callObjectRef.current;
      if (currentCallObject) {
        console.log("🧹 Cleaning up Daily call object on unmount...");
        try {
          currentCallObject.destroy().catch((e) => {
            console.warn("Error destroying on unmount:", e);
          });
        } catch (e) {
          console.warn("Error in cleanup:", e);
        }
      }

      // Reset refs
      isJoiningRef.current = false;
      callObjectRef.current = null;
    };
  }, []); // Empty dependency array - only run on actual unmount

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
