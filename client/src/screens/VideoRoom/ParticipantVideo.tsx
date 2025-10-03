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
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from "../../styles";

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
      <VideoElement
        ref={videoRef}
        autoPlay
        muted={participant.isLocal}
        playsInline
        $isVisible={participant.videoEnabled}
        $isFullscreen={isFullscreen}
        onError={(e) => {
          console.error("Video error for:", participant.name, e);
        }}
      />

      {!participant.videoEnabled && (
        <VideoDisabledOverlay $isFullscreen={isFullscreen}>
          <Avatar
            size={isFullscreen ? 80 : 48}
            icon={<UserOutlined />}
            style={{
              backgroundColor: COLORS.info.main,
              marginBottom: SPACING.md,
            }}
          />
          <Text
            style={{
              color: COLORS.neutral.white,
              fontSize: isFullscreen ? FONT_SIZES.lg : FONT_SIZES.md,
              fontWeight: FONT_WEIGHTS.medium,
            }}
          >
            {participant.name}
          </Text>
        </VideoDisabledOverlay>
      )}

      <ParticipantInfoOverlay $isFullscreen={isFullscreen}>
        <ParticipantName $isFullscreen={isFullscreen}>
          {participant.name} {participant.isLocal && "(You)"}
        </ParticipantName>
        <ParticipantStatusIcons>
          {!participant.audioEnabled && (
            <AudioMutedOutlined
              style={{
                color: COLORS.error.main,
                fontSize: isFullscreen ? FONT_SIZES.md : FONT_SIZES.sm,
              }}
            />
          )}
          {!participant.videoEnabled && (
            <VideoCameraAddOutlined
              style={{
                color: COLORS.error.main,
                fontSize: isFullscreen ? FONT_SIZES.md : FONT_SIZES.sm,
              }}
            />
          )}
        </ParticipantStatusIcons>
      </ParticipantInfoOverlay>
    </ParticipantVideoContainer>
  );
};

export default ParticipantVideo;
