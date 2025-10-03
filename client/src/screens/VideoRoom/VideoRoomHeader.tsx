import React, { useCallback } from "react";
import { Tooltip } from "antd";
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  VideoRoomHeader as StyledHeader,
  HeaderLeft,
  HeaderRight,
  RoomTitle,
  ParticipantCount,
  CallControlsContainer,
  ControlButton,
} from "./VideoRoom.styles";

interface VideoRoomHeaderProps {
  roomName?: string;
  participantCount: number;
  localAudio: boolean;
  localVideo: boolean;
  audioToggling: boolean;
  videoToggling: boolean;
  onToggleAudio: () => Promise<void>;
  onToggleVideo: () => Promise<void>;
  onLeaveRoom: () => Promise<void>;
}

export const VideoRoomHeader: React.FC<VideoRoomHeaderProps> = ({
  roomName,
  participantCount,
  localAudio,
  localVideo,
  audioToggling,
  videoToggling,
  onToggleAudio,
  onToggleVideo,
  onLeaveRoom,
}) => {
  const handleToggleAudio = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
      await onToggleAudio();
    },
    [onToggleAudio]
  );

  const handleToggleVideo = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
      await onToggleVideo();
    },
    [onToggleVideo]
  );

  const handleLeaveRoom = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
      await onLeaveRoom();
    },
    [onLeaveRoom]
  );

  return (
    <StyledHeader>
      <HeaderLeft>
        <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <RoomTitle>{roomName?.replace(/-/g, " ")}</RoomTitle>
          <ParticipantCount>{participantCount}</ParticipantCount>
        </div>
      </HeaderLeft>

      <HeaderRight>
        <CallControlsContainer>
          <Tooltip title={localAudio ? "Mute microphone" : "Unmute microphone"}>
            <ControlButton
              type={localAudio ? "default" : "primary"}
              htmlType="button"
              danger={!localAudio}
              icon={localAudio ? <AudioOutlined /> : <AudioMutedOutlined />}
              onClick={handleToggleAudio}
              loading={audioToggling}
              size="large"
              $isActive={localAudio}
            />
          </Tooltip>

          <Tooltip title={localVideo ? "Turn off camera" : "Turn on camera"}>
            <ControlButton
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
              onClick={handleToggleVideo}
              loading={videoToggling}
              size="large"
              $isActive={localVideo}
            />
          </Tooltip>

          <Tooltip title="Leave room">
            <ControlButton
              type="primary"
              htmlType="button"
              danger
              icon={<PhoneOutlined />}
              onClick={handleLeaveRoom}
              size="large"
            />
          </Tooltip>
        </CallControlsContainer>
      </HeaderRight>
    </StyledHeader>
  );
};

export default VideoRoomHeader;
