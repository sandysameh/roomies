import React from "react";
import { Avatar, Typography } from "antd";
import {
  AudioMutedOutlined,
  VideoCameraAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  ParticipantVideoContainer,
  VideoElement,
  VideoDisabledOverlay,
  ParticipantInfoOverlay,
  ParticipantName,
  ParticipantStatusIcons,
} from "./VideoRoom.styles";
import { Participant } from "../../types";

const { Text } = Typography;

interface ParticipantVideoProps {
  participant: Participant;
  videoRef: (el: HTMLVideoElement | null) => void;
  isFullscreen: boolean;
}

export const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  videoRef,
  isFullscreen,
}) => {
  return (
    <ParticipantVideoContainer $isFullscreen={isFullscreen}>
      {/* Video element */}
      <VideoElement
        ref={videoRef}
        autoPlay
        muted={participant.isLocal}
        playsInline
        $isVisible={participant.videoEnabled}
        $isFullscreen={isFullscreen}
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
        <VideoDisabledOverlay $isFullscreen={isFullscreen}>
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
        </VideoDisabledOverlay>
      )}

      {/* Participant info overlay */}
      <ParticipantInfoOverlay $isFullscreen={isFullscreen}>
        <ParticipantName $isFullscreen={isFullscreen}>
          {participant.name} {participant.isLocal && "(You)"}
        </ParticipantName>
        <ParticipantStatusIcons>
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
        </ParticipantStatusIcons>
      </ParticipantInfoOverlay>
    </ParticipantVideoContainer>
  );
};

export default ParticipantVideo;
