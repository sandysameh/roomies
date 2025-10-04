import React from "react";
import { Badge, Space } from "antd";
import {
  VideoCameraOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Room } from "../../types";
import { PrimaryButton } from "../../components";
import {
  RoomCard as StyledRoomCard,
  RoomAvatar,
  RoomTitleContainer,
  RoomTitle,
  RoomDescription,
  ParticipantInfo,
  ParticipantIcon,
  ParticipantText,
  RoomDate,
  DeleteButton,
} from "./Dashboard.styles";
import { COLORS } from "../../styles";

interface RoomCardProps {
  room: Room;
  isAdmin: boolean;
  onJoinRoom: (roomName: string) => void;
  onDeleteRoom: (roomName: string) => void;
  width?: string;
  height?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isAdmin,
  onJoinRoom,
  onDeleteRoom,
  width,
  height,
}) => {
  const cardActions = [
    <PrimaryButton
      key="join"
      icon={<VideoCameraOutlined />}
      onClick={() => onJoinRoom(room.name)}
      width="80%"
    >
      Join Room
    </PrimaryButton>,
    ...(isAdmin
      ? [
          <DeleteButton
            key="delete"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRoom(room.name);
            }}
            title="Delete Room"
          >
            Delete
          </DeleteButton>,
        ]
      : []),
  ];

  return (
    <StyledRoomCard
      hoverable
      actions={cardActions}
      width={width}
      height={height}
    >
      <StyledRoomCard.Meta
        avatar={<RoomAvatar icon={<VideoCameraOutlined />} />}
        title={
          <RoomTitleContainer>
            <RoomTitle>{room.name.replace(/-/g, " ")}</RoomTitle>
            <Badge
              count={room.participantCount}
              style={{
                backgroundColor:
                  room.participantCount > 0
                    ? COLORS.success.main
                    : COLORS.background.disabled,
              }}
              title={`${room.participantCount} participant(s)`}
            />
          </RoomTitleContainer>
        }
        description={
          <RoomDescription>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <ParticipantInfo>
                <ParticipantIcon>
                  <TeamOutlined />
                </ParticipantIcon>
                <ParticipantText type="secondary">
                  {room.participantCount === 0
                    ? "No participants"
                    : `${room.participantCount} participant${
                        room.participantCount > 1 ? "s" : ""
                      }`}
                </ParticipantText>
              </ParticipantInfo>
              <RoomDate type="secondary">
                {new Date(room.createdAt).toLocaleDateString()}
              </RoomDate>
            </Space>
          </RoomDescription>
        }
      />
    </StyledRoomCard>
  );
};

export default RoomCard;
