import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Button,
  Typography,
  Space,
  Card,
  Avatar,
  Badge,
  message,
  Spin,
  Tooltip,
} from "antd";
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Daily from "@daily-co/daily-js";
import { useAuth } from "../context/AuthContext";
import { roomsAPI } from "../services/api";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

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

const VideoRoom: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // Real participants state
  const [participants, setParticipants] = useState<RealParticipant[]>([]);
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [audioToggling, setAudioToggling] = useState(false);
  const [videoToggling, setVideoToggling] = useState(false);

  // Refs
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const callObjectRef = useRef<any>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const isInitializedRef = useRef<boolean>(false);

  const setupRoom = useCallback(async () => {
    if (!roomName || !user) {
      console.error("Missing roomName or user:", { roomName, user });
      message.error("Missing room information");
      navigate("/dashboard");
      return;
    }

    // Prevent multiple setup attempts
    if (joining || isInitializedRef.current) {
      console.log("Already setting up, skipping...");
      return;
    }

    // Check if there's already an active call object that's in a meeting
    const existingCallObject = (window as any).dailyCallObject;
    if (existingCallObject && callObjectRef.current === existingCallObject) {
      const meetingState = existingCallObject.meetingState();
      if (meetingState === "joined-meeting") {
        console.log(
          "Already in a meeting with this call object, skipping setup"
        );
        setLoading(false);
        return;
      }
    }

    isInitializedRef.current = true;

    try {
      setJoining(true);
      console.log("Setting up room for:", roomName);

      let callObject = (window as any).dailyCallObject;
      let roomData = location.state?.roomData;

      // Check if Daily call object exists and destroy it
      if (callObject) {
        console.log("🧹 Existing Daily call object found, destroying...");
        try {
          // First leave if currently in a call
          const callState = callObject.meetingState();
          if (callState !== "left-meeting" && callState !== "error") {
            console.log("🚪 Leaving existing call before destroying...");
            await callObject.leave();
          }

          // Wait a bit for leave to complete
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Now destroy
          await callObject.destroy();
          console.log("✅ Successfully destroyed existing call object");
        } catch (e) {
          console.warn("Error destroying existing call object:", e);
        }
        callObject = null;
        (window as any).dailyCallObject = null;
        callObjectRef.current = null;

        // Wait a bit more to ensure cleanup is complete
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // If no room data from navigation, fetch it
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

      // Create new Daily call object and join
      console.log("🚀 Creating new Daily call object and joining room...");
      try {
        // Double-check that no call object exists before creating
        try {
          const existingInstance = Daily.getCallInstance();
          if (existingInstance) {
            console.log(
              "⚠️ Found existing call object instance, destroying it..."
            );
            try {
              await existingInstance.destroy();
            } catch (e) {
              console.warn("Error destroying instance:", e);
            }
            // Wait for cleanup
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (e) {
          // No existing instance, which is what we want
          console.log("No existing call instance found, proceeding...");
        }

        callObject = Daily.createCallObject();
        console.log("✅ Successfully created new Daily call object");
      } catch (createError: any) {
        console.error("❌ Error creating Daily call object:", createError);
        throw new Error(
          `Failed to create Daily call object: ${
            createError?.message || createError
          }`
        );
      }

      await callObject.join({
        url: roomData.url,
        token: localStorage.getItem("token") || "",
        userName: user?.name || user?.email || "User",
        startVideoOff: true, // Start with video off so user can control it
        startAudioOff: false, // Start with audio on
      });

      // Store room data and call object
      setRoomData(roomData);
      callObjectRef.current = callObject;
      (window as any).dailyCallObject = callObject;

      // Set up Daily event listeners
      setupDailyEventListeners(callObject);

      // Check media permissions and setup
      setTimeout(async () => {
        console.log("🔧 Initializing media setup...");

        // Check available media devices
        await checkMediaDevices();

        // Check microphone permissions
        try {
          const micPermission = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          console.log("🎤 Microphone permission:", micPermission.state);
        } catch (e) {
          console.log("🎤 Could not check microphone permission");
        }

        // Check camera permissions
        try {
          const cameraPermission = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          console.log("📹 Camera permission:", cameraPermission.state);
        } catch (e) {
          console.log("📹 Could not check camera permission");
        }

        updateParticipants(callObject);

        // Try to get existing video tracks
        const participants = callObject.participants();
        Object.values(participants).forEach((participant: any) => {
          if (participant.tracks?.video?.track) {
            console.log(
              "Found existing video track for:",
              participant.session_id
            );
            updateVideoElement(
              participant.session_id,
              participant.tracks.video.track
            );
          }
        });

        // Setup audio for existing participants
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

      setLoading(false);
      message.success(`Joined room: ${roomName}`);
    } catch (error: any) {
      console.error("Error setting up room:", error);
      message.error("Failed to setup room");

      // Clean up on error
      if (callObjectRef.current) {
        try {
          await callObjectRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying call object after error:", e);
        }
        callObjectRef.current = null;
        (window as any).dailyCallObject = null;
      }

      // Also clean up any remaining instances
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

      isInitializedRef.current = false;
      navigate("/dashboard");
    } finally {
      setJoining(false);
    }
  }, [roomName, user, navigate, location.state]);

  const setupDailyEventListeners = useCallback((call: any) => {
    // Participant joined
    call.on("participant-joined", (event: any) => {
      console.log("Participant joined:", event.participant);
      updateParticipants(call);
    });

    // Participant left
    call.on("participant-left", (event: any) => {
      console.log("Participant left:", event.participant);
      updateParticipants(call);
    });

    // Participant updated (audio/video changes)
    call.on("participant-updated", (event: any) => {
      console.log("Participant updated:", event.participant);
      updateParticipants(call);

      // Update local state if it's the local participant
      if (event.participant.local) {
        setLocalAudio(event.participant.audio);
        setLocalVideo(event.participant.video);

        // If video was turned on, ensure the video element gets the stream
        if (event.participant.video && localVideoRef.current) {
          setTimeout(() => {
            try {
              const localVideoStream = call.localVideo();
              if (localVideoStream && localVideoRef.current) {
                console.log(
                  "🎯 Applying video stream after participant update"
                );
                localVideoRef.current.srcObject = localVideoStream;
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

    // Track started (video/audio track available)
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

      // Handle audio tracks for remote participants
      if (event.track.kind === "audio" && !event.participant.local) {
        console.log(
          "🔊 Setting up remote audio for:",
          event.participant.user_name
        );

        // Create audio element for remote participant
        const audioElement = new Audio();
        audioElement.srcObject = new MediaStream([event.track]);
        audioElement.autoplay = true;
        audioElement.volume = 1.0;

        // Play the audio
        audioElement.play().catch((error) => {
          console.error("❌ Error playing remote audio:", error);
        });

        console.log(
          "✅ Remote audio setup complete for:",
          event.participant.user_name
        );
      }

      // Handle video tracks
      if (event.track.kind === "video") {
        // Force update participants first to ensure we have the latest data
        updateParticipants(call);

        // Then update the video element
        setTimeout(() => {
          updateVideoElement(event.participant.session_id, event.track);
        }, 100);
      }
    });

    // Track stopped
    call.on("track-stopped", (event: any) => {
      console.log("Track stopped:", event);
      removeVideoElement(event.participant.session_id);
    });

    // Call state changes
    call.on("joined-meeting", (event: any) => {
      console.log("Joined meeting:", event);
      updateParticipants(call);

      // Initialize local video state based on current call state
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
    });

    // Error handling
    call.on("error", (event: any) => {
      console.error("Daily.js error:", event);
      message.error("Video call error occurred");
    });
  }, []);

  const updateParticipants = useCallback(
    (call: any) => {
      const dailyParticipants = call.participants();
      console.log("Raw Daily participants:", dailyParticipants);

      const participantList: RealParticipant[] = Object.values(
        dailyParticipants
      ).map((p: any) => {
        // For local participant, use the actual user name from auth context
        const participantName = p.local
          ? user?.name || user?.email || "You"
          : p.user_name || p.userName || p.user_id || "Unknown User";

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
    (sessionId: string, track: MediaStreamTrack) => {
      console.log(
        "🎥 Updating video element for session:",
        sessionId,
        "track kind:",
        track.kind,
        "track state:",
        track.readyState
      );

      // Get participant data directly from Daily.js to ensure we have the latest info
      let isLocalParticipant = false;
      let participantName = "Unknown";

      if (callObjectRef.current) {
        const dailyParticipants = callObjectRef.current.participants();
        const dailyParticipant = Object.values(dailyParticipants).find(
          (p: any) => p.session_id === sessionId
        ) as any;

        if (dailyParticipant) {
          isLocalParticipant = dailyParticipant.local;
          participantName = dailyParticipant.local
            ? user?.name || user?.email || "You"
            : dailyParticipant.user_name ||
              dailyParticipant.userName ||
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

        // For local participant, try to use Daily.js localVideo() method first
        if (isLocalParticipant && callObjectRef.current) {
          try {
            const localVideoStream = callObjectRef.current.localVideo();
            if (localVideoStream) {
              console.log(
                "🎯 Using Daily.js localVideo() method for local participant"
              );
              videoElement.srcObject = localVideoStream;
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
          // For remote participants, use the track directly
          const stream = new MediaStream([track]);
          videoElement.srcObject = stream;
        }

        // Add event listeners to debug video loading
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

        // If it's a local participant and video element not found, try to find it again
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

  const removeVideoElement = useCallback((sessionId: string) => {
    const videoElement = videoRefs.current.get(sessionId);
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }, []);

  // Setup room once when component mounts
  useEffect(() => {
    if (roomName && user) {
      // Always attempt to setup room - the setupRoom function will handle
      // both cases: existing call object (destroy and recreate) or no call object (create new)
      setupRoom();
    }
  }, [roomName, user, setupRoom]);

  // Cleanup on unmount - only destroy when component is actually unmounting
  useEffect(() => {
    return () => {
      // Only destroy the call object when the component is unmounting
      // This ensures we clean up resources when navigating away from the app
      console.log("Component unmounting - cleaning up all call objects...");

      // Clean up our specific call object
      if (callObjectRef.current) {
        try {
          callObjectRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying call object in cleanup:", e);
        }
        callObjectRef.current = null;
      }

      // Clean up any remaining Daily call object instances
      try {
        const existingInstance = Daily.getCallInstance();
        if (existingInstance) {
          try {
            existingInstance.destroy();
          } catch (e) {
            console.warn("Error destroying instance in cleanup:", e);
          }
        }
      } catch (e) {
        console.warn("Error getting call object instance:", e);
      }

      // Clear global call object
      (window as any).dailyCallObject = null;

      // Reset initialization flag
      isInitializedRef.current = false;

      // Clear video refs
      videoRefs.current.clear();
    };
  }, []);

  const toggleAudio = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }

      if (audioToggling || !callObjectRef.current) {
        console.log(
          "⚠️ Audio toggle blocked - toggling:",
          audioToggling,
          "callObject:",
          !!callObjectRef.current
        );
        return;
      }

      setAudioToggling(true);
      const newAudioState = !localAudio;

      try {
        console.log("🎤 Toggling audio from", localAudio, "to", newAudioState);

        // Use Daily.js to toggle audio (it will handle permissions automatically)
        await callObjectRef.current.setLocalAudio(newAudioState);
        console.log("✅ Daily.js setLocalAudio completed");

        // Update local state immediately
        setLocalAudio(newAudioState);

        message.info(newAudioState ? "Microphone unmuted" : "Microphone muted");
      } catch (error: any) {
        console.error("❌ Error toggling audio:", error);
        message.error(
          `Failed to ${newAudioState ? "unmute" : "mute"} microphone: ${
            error.message || error
          }`
        );

        // Reset state on error
        setLocalAudio(!newAudioState);
      } finally {
        setTimeout(() => {
          setAudioToggling(false);
          console.log("🔓 Audio toggle unlocked");
        }, 200);
      }
    },
    [localAudio, audioToggling]
  );

  // Check available media devices
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

  // Force refresh video element
  const forceRefreshVideo = useCallback(() => {
    if (callObjectRef.current && localVideoRef.current) {
      try {
        const localVideoStream = callObjectRef.current.localVideo();
        if (localVideoStream) {
          console.log("🔄 Force refreshing local video element");
          localVideoRef.current.srcObject = localVideoStream;
          localVideoRef.current.play().catch(console.error);
        }
      } catch (error) {
        console.warn("⚠️ Error force refreshing video:", error);
      }
    }
  }, []);

  // Debug function to check current state
  const debugCurrentState = useCallback(() => {
    if (callObjectRef.current) {
      const participants = callObjectRef.current.participants();
      const localParticipant = participants.local;

      console.log("🔍 DEBUG - Current state:", {
        localVideo,
        localAudio,
        localParticipant: localParticipant,
        localVideoTrack: localParticipant?.tracks?.video?.track,
        localAudioTrack: localParticipant?.tracks?.audio?.track,
        localVideoElement: localVideoRef.current,
        localVideoElementSrc: localVideoRef.current?.srcObject,
        allParticipants: participants,
      });
    }
  }, [localVideo, localAudio]);

  const toggleVideo = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }

      if (videoToggling || !callObjectRef.current) {
        console.log(
          "⚠️ Video toggle blocked - toggling:",
          videoToggling,
          "callObject:",
          !!callObjectRef.current
        );
        return;
      }

      setVideoToggling(true);
      const newVideoState = !localVideo;

      try {
        console.log("🎥 Toggling video from", localVideo, "to", newVideoState);
        debugCurrentState();

        if (newVideoState) {
          // Turning ON video
          console.log("📹 Turning ON camera...");

          // Use Daily.js to enable local video (this will request permissions automatically)
          await callObjectRef.current.setLocalVideo(true);
          console.log("✅ Daily.js setLocalVideo(true) completed");

          // Optionally start camera explicitly
          try {
            await callObjectRef.current.startCamera();
            console.log("📹 Daily.js startCamera() completed");
          } catch (startError) {
            console.warn(
              "⚠️ startCamera() warning (may be normal):",
              startError
            );
          }
        } else {
          // Turning OFF video
          console.log("📹 Turning OFF camera...");
          await callObjectRef.current.setLocalVideo(false);
          console.log("✅ Daily.js setLocalVideo(false) completed");
        }

        // Update local state immediately (don't wait for event)
        setLocalVideo(newVideoState);

        // Force update participants and ensure video element is ready
        setTimeout(() => {
          updateParticipants(callObjectRef.current);

          // If turning on video, ensure the video element gets the stream
          if (newVideoState && localVideoRef.current) {
            try {
              const localVideoStream = callObjectRef.current.localVideo();
              if (localVideoStream) {
                console.log(
                  "🎯 Applying local video stream to element after toggle"
                );
                localVideoRef.current.srcObject = localVideoStream;
                localVideoRef.current.play().catch(console.error);
              }
            } catch (error) {
              console.warn(
                "⚠️ Error applying video stream after toggle:",
                error
              );
            }
          }

          debugCurrentState();
        }, 500);

        message.info(newVideoState ? "Camera turned on" : "Camera turned off");
      } catch (error: any) {
        console.error("❌ Error toggling video:", error);
        message.error(
          `Failed to ${newVideoState ? "enable" : "disable"} camera: ${
            error.message || error
          }`
        );

        // Reset state on error
        setLocalVideo(!newVideoState);
      } finally {
        setTimeout(() => {
          setVideoToggling(false);
          console.log("🔓 Video toggle unlocked");
        }, 300);
      }
    },
    [localVideo, videoToggling, debugCurrentState]
  );

  const leaveRoom = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }

      try {
        // Leave the Daily.js call (but keep the call object for reuse)
        if (callObjectRef.current) {
          console.log("Leaving Daily call...");
          try {
            await callObjectRef.current.leave();
          } catch (leaveError) {
            console.warn("Error leaving call:", leaveError);
          }

          // Don't destroy the call object - keep it for reuse
          // callObjectRef.current = null; // Don't clear this
        }

        // Don't clear global call object - keep it for reuse
        // (window as any).dailyCallObject = null;

        // Reset initialization flag so room can be rejoined
        isInitializedRef.current = false;

        // Clear video refs
        videoRefs.current.clear();

        message.info("Left the room");
        navigate("/dashboard");
      } catch (error) {
        console.error("Error leaving room:", error);
        navigate("/dashboard");
      }
    },
    [navigate]
  );

  const getGridLayout = (participantCount: number) => {
    if (participantCount === 1) {
      return {
        columns: "1fr",
        rows: "1fr",
        aspectRatio: "16/9",
      };
    } else if (participantCount === 2) {
      return {
        columns: "1fr 1fr",
        rows: "1fr",
        aspectRatio: "16/9",
      };
    } else if (participantCount <= 4) {
      return {
        columns: "1fr 1fr",
        rows: "1fr 1fr",
        aspectRatio: "16/9",
      };
    } else if (participantCount <= 6) {
      return {
        columns: "1fr 1fr 1fr",
        rows: "1fr 1fr",
        aspectRatio: "16/9",
      };
    } else if (participantCount <= 9) {
      return {
        columns: "1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        aspectRatio: "16/9",
      };
    } else {
      return {
        columns: "repeat(4, 1fr)",
        rows: "repeat(3, 1fr)",
        aspectRatio: "16/9",
      };
    }
  };

  const renderParticipantVideo = (participant: RealParticipant) => {
    const participantCount = participants.length;
    const isFullscreen = participantCount === 1;

    return (
      <div
        key={participant.id}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          borderRadius: isFullscreen ? "0" : "12px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          border: "none",
          boxShadow: isFullscreen ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
        }}
        onMouseEnter={(e) => {
          if (!isFullscreen) {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isFullscreen) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
          }
        }}
      >
        {/* Video element */}
        <video
          ref={(el) => {
            if (el) {
              if (participant.isLocal) {
                localVideoRef.current = el;
                console.log(
                  "🏠 Local video ref set:",
                  el,
                  "for participant:",
                  participant.name
                );

                // Try to get existing local video track immediately
                if (callObjectRef.current) {
                  try {
                    // Use Daily.js method to get local video
                    const localVideo = callObjectRef.current.localVideo();
                    if (localVideo) {
                      console.log(
                        "🎯 Found local video using Daily.js method, applying immediately"
                      );
                      el.srcObject = localVideo;
                      el.play().catch(console.error);
                    } else {
                      // Fallback to participant tracks
                      const localParticipant =
                        callObjectRef.current.participants().local as any;
                      if (localParticipant?.tracks?.video?.track) {
                        console.log(
                          "🎯 Found existing local video track via participant, applying immediately"
                        );
                        const stream = new MediaStream([
                          localParticipant.tracks.video.track,
                        ]);
                        el.srcObject = stream;
                        el.play().catch(console.error);
                      }
                    }
                  } catch (error) {
                    console.warn("⚠️ Error getting local video:", error);
                  }
                }
              } else {
                videoRefs.current.set(participant.id, el);
                console.log(
                  "🌐 Remote video ref set for:",
                  participant.id,
                  participant.name,
                  el
                );

                // Try to get existing remote video track immediately
                if (callObjectRef.current) {
                  const participants = callObjectRef.current.participants();
                  const remoteParticipant = Object.values(participants).find(
                    (p: any) => p.session_id === participant.id
                  ) as any;
                  if (remoteParticipant?.tracks?.video?.track) {
                    console.log(
                      "🎯 Found existing remote video track, applying immediately"
                    );
                    const stream = new MediaStream([
                      remoteParticipant.tracks.video.track,
                    ]);
                    el.srcObject = stream;
                    el.play().catch(console.error);
                  }
                }
              }
            }
          }}
          autoPlay
          muted={participant.isLocal}
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: participant.videoEnabled ? "block" : "none",
            transform: "scaleX(-1)", // No mirroring for any video
            borderRadius: isFullscreen ? "0" : "12px",
          }}
          onLoadedMetadata={() => {
            console.log(
              "📺 Video metadata loaded for:",
              participant.name,
              participant.isLocal ? "(LOCAL)" : "(REMOTE)"
            );
          }}
          onError={(e) => {
            console.error("❌ Video error for:", participant.name, e);
          }}
        />

        {/* Video disabled overlay */}
        {!participant.videoEnabled && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#2a2a2a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: isFullscreen ? "0" : "12px",
            }}
          >
            <Avatar
              size={isFullscreen ? 80 : 48}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#4a90e2",
                marginBottom: "12px",
              }}
            />
            <Text
              style={{
                color: "#ffffff",
                fontSize: isFullscreen ? "20px" : "16px",
                fontWeight: "500",
              }}
            >
              {participant.name}
            </Text>
          </div>
        )}

        {/* Participant info overlay */}
        <div
          style={{
            position: "absolute",
            bottom: isFullscreen ? "16px" : "8px",
            left: isFullscreen ? "16px" : "8px",
            right: isFullscreen ? "16px" : "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.6)",
            padding: isFullscreen ? "8px 12px" : "6px 8px",
            borderRadius: "8px",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: isFullscreen ? "14px" : "12px",
              fontWeight: 500,
            }}
          >
            {participant.name} {participant.isLocal && "(You)"}
          </Text>
          <Space size="small">
            {!participant.audioEnabled && (
              <AudioMutedOutlined
                style={{
                  color: "#ff4d4f",
                  fontSize: isFullscreen ? "14px" : "12px",
                }}
              />
            )}
            {!participant.videoEnabled && (
              <VideoCameraAddOutlined
                style={{
                  color: "#ff4d4f",
                  fontSize: isFullscreen ? "14px" : "12px",
                }}
              />
            )}
          </Space>
        </div>
      </div>
    );
  };

  if (loading || joining) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Spin size="large" />
        <Text style={{ marginTop: "16px", fontSize: "16px" }}>
          {joining ? "Joining room..." : "Loading..."}
        </Text>
      </div>
    );
  }

  const localParticipant = participants.find((p) => p.isLocal);
  const remoteParticipants = participants.filter((p) => !p.isLocal);

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        style={{
          background: "#001529",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
            style={{ color: "white" }}
          >
            Back to Dashboard
          </Button>
          <Title level={4} style={{ margin: 0, color: "white" }}>
            {roomName?.replace(/-/g, " ")}
          </Title>
        </Space>

        {/* Call Controls */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Tooltip title={localAudio ? "Mute microphone" : "Unmute microphone"}>
            <Button
              type={localAudio ? "default" : "primary"}
              htmlType="button"
              danger={!localAudio}
              icon={localAudio ? <AudioOutlined /> : <AudioMutedOutlined />}
              onClick={toggleAudio}
              loading={audioToggling}
              size="large"
              style={{
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>

          <Tooltip title={localVideo ? "Turn off camera" : "Turn on camera"}>
            <Button
              type={localVideo ? "default" : "primary"}
              htmlType="button"
              danger={!localVideo}
              icon={
                localVideo ? (
                  <VideoCameraOutlined />
                ) : (
                  <VideoCameraAddOutlined />
                )
              }
              onClick={toggleVideo}
              loading={videoToggling}
              size="large"
              style={{
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>

          <Tooltip title="Leave room">
            <Button
              type="primary"
              htmlType="button"
              danger
              icon={<PhoneOutlined />}
              onClick={leaveRoom}
              size="large"
              style={{
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>
        </div>
      </Header>

      <Layout>
        <Content
          style={{
            padding: participants.length === 1 ? "0" : "16px",
            background: "#0f0f0f",
          }}
        >
          {/* Main video area */}
          <div
            ref={videoContainerRef}
            style={{
              height:
                participants.length === 1 ? "92vh" : "calc(100vh - 120px)",
              display: "grid",
              gridTemplateColumns: getGridLayout(participants.length).columns,
              gridTemplateRows: getGridLayout(participants.length).rows,
              gap: participants.length === 1 ? "0" : "8px",
              padding: participants.length === 1 ? "0" : "8px",
              borderRadius: participants.length === 1 ? "0" : "8px",
            }}
          >
            {/* Local participant video */}
            {localParticipant && renderParticipantVideo(localParticipant)}

            {/* Remote participants videos */}
            {remoteParticipants.map((participant) =>
              renderParticipantVideo(participant)
            )}

            {/* Empty state when alone */}
            {participants.length === 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  zIndex: 10,
                  background: "rgba(0, 0, 0, 0.7)",
                  padding: "24px 32px",
                  borderRadius: "12px",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <UserOutlined
                  style={{
                    fontSize: "64px",
                    color: "#666",
                    marginBottom: "16px",
                    display: "block",
                  }}
                />
                <Text style={{ color: "white", fontSize: "16px" }}>
                  Waiting for others to join...
                </Text>
              </div>
            )}
          </div>
        </Content>

        <Sider width={300} style={{ background: "white" }}>
          <div style={{ padding: "24px" }}>
            <Title level={5}>Participants ({participants.length})</Title>

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {participants.map((participant) => (
                <Card
                  key={participant.id}
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Card.Meta
                    avatar={
                      <Badge
                        dot
                        color={participant.isLocal ? "#52c41a" : "#1890ff"}
                        offset={[-5, 5]}
                      >
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>
                          {participant.name}
                          {participant.isLocal && " (You)"}
                          {participant.isOwner && " 👑"}
                        </span>
                      </div>
                    }
                    description={
                      <Space>
                        <Badge
                          status={
                            participant.audioEnabled ? "success" : "error"
                          }
                          text={participant.audioEnabled ? "Audio on" : "Muted"}
                        />
                        <Badge
                          status={
                            participant.videoEnabled ? "success" : "error"
                          }
                          text={
                            participant.videoEnabled ? "Video on" : "Video off"
                          }
                        />
                      </Space>
                    }
                  />
                </Card>
              ))}
            </Space>
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default VideoRoom;
