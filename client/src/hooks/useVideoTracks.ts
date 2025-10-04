import { useRef, useCallback } from "react";
import { DailyCall } from "@daily-co/daily-js";

export const useVideoTracks = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const updateVideoElement = useCallback(
    (
      sessionId: string,
      track: MediaStreamTrack,
      call: DailyCall,
      isLocal: boolean
    ) => {
      const videoElement = isLocal
        ? localVideoRef.current
        : videoRefs.current.get(sessionId);

      if (videoElement && track.kind === "video") {
        if (isLocal && call) {
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
      } else if (isLocal && !videoElement && track.kind === "video") {
        // Retry for local video if element not ready
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
    []
  );

  const clearVideoElement = useCallback((sessionId: string) => {
    const videoElement = videoRefs.current.get(sessionId);
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }, []);

  const clearAllVideoElements = useCallback(() => {
    videoRefs.current.clear();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  return {
    localVideoRef,
    videoRefs,
    updateVideoElement,
    clearVideoElement,
    clearAllVideoElements,
  };
};
