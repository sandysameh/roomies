import { useEffect, useCallback } from "react";
import { DailyCall } from "@daily-co/daily-js";
import { message } from "antd";

interface UseDailyEventsOptions {
  callObject: DailyCall | null;
  onParticipantUpdate: (call: DailyCall) => void;
  onTrackStarted: (
    sessionId: string,
    track: MediaStreamTrack,
    call: DailyCall,
    isLocal: boolean
  ) => void;
  onTrackStopped: (sessionId: string) => void;
  onLocalMediaUpdate: (audio: boolean, video: boolean) => void;
}

export const useDailyEvents = (options: UseDailyEventsOptions) => {
  const {
    callObject,
    onParticipantUpdate,
    onTrackStarted,
    onTrackStopped,
    onLocalMediaUpdate,
  } = options;

  const setupEventListeners = useCallback(
    (call: DailyCall) => {
      // Participant events
      call.on("participant-joined", () => {
        onParticipantUpdate(call);
      });

      call.on("participant-left", () => {
        onParticipantUpdate(call);
      });

      call.on("participant-updated", (event: any) => {
        onParticipantUpdate(call);

        if (event.participant.local) {
          // Check the actual track state, not just permissions
          const audioEnabled = event.participant.tracks?.audio?.state === "playable";
          const videoEnabled = event.participant.tracks?.video?.state === "playable";
          
          onLocalMediaUpdate(audioEnabled, videoEnabled);

          // Handle local video updates
          if (videoEnabled) {
            setTimeout(() => {
              try {
                const localVideoStream = call.localVideo();
                if (localVideoStream) {
                  // Video will be handled by track-started event
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
          setTimeout(() => {
            onTrackStarted(
              event.participant.session_id,
              event.track,
              call,
              event.participant.local
            );
          }, 100);
        }
      });

      call.on("track-stopped", (event: any) => {
        // Only clear video elements when video tracks stop, not audio tracks
        if (event.track.kind === "video") {
          onTrackStopped(event.participant.session_id);
        }
      });

      // Meeting state events
      call.on("joined-meeting", () => {
        onParticipantUpdate(call);
        const localParticipant = call.participants().local;
        if (localParticipant) {
          // Check the actual track state, not just permissions
          const audioEnabled = localParticipant.tracks?.audio?.state === "playable";
          const videoEnabled = localParticipant.tracks?.video?.state === "playable";
          onLocalMediaUpdate(audioEnabled, videoEnabled);
        }
      });

      call.on("left-meeting", () => {
        // Handled by leaveRoom
      });

      call.on("error", (event: any) => {
        console.error("Daily.js error:", event);
        message.error("Video call error occurred");
      });
    },
    [onParticipantUpdate, onTrackStarted, onTrackStopped, onLocalMediaUpdate]
  );

  // Setup event listeners when call object is available
  useEffect(() => {
    if (callObject) {
      setupEventListeners(callObject);
    }
  }, [callObject, setupEventListeners]);

  return {
    setupEventListeners,
  };
};
