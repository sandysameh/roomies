import { useState, useCallback } from "react";
import { DailyCall } from "@daily-co/daily-js";
import { message } from "antd";

export const useMediaControls = (callObject: DailyCall | null) => {
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(false);
  const [audioToggling, setAudioToggling] = useState(false);
  const [videoToggling, setVideoToggling] = useState(false);

  const toggleAudio = useCallback(async () => {
    if (audioToggling || !callObject) {
      return;
    }

    setAudioToggling(true);
    const newAudioState = !localAudio;

    try {
      await callObject.setLocalAudio(newAudioState);
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

  const toggleVideo = useCallback(async () => {
    if (videoToggling || !callObject) {
      return;
    }

    setVideoToggling(true);
    const newVideoState = !localVideo;

    try {
      if (newVideoState) {
        await callObject.setLocalVideo(true);
        try {
          await callObject.startCamera();
        } catch (startError) {
          console.error("startCamera() warning:", startError);
        }
      } else {
        await callObject.setLocalVideo(false);
      }

      setLocalVideo(newVideoState);
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
  }, [localVideo, videoToggling, callObject]);

  // Update media states from external sources (like participant updates)
  const updateMediaStates = useCallback((audio: boolean, video: boolean) => {
    setLocalAudio(audio);
    setLocalVideo(video);
  }, []);

  return {
    localAudio,
    localVideo,
    audioToggling,
    videoToggling,
    toggleAudio,
    toggleVideo,
    updateMediaStates,
  };
};
