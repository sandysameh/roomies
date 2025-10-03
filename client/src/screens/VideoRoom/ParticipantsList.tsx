import React from "react";
import { Space, Avatar, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  ParticipantsSider,
  ParticipantsSiderContent,
  ParticipantListTitle,
  ParticipantCard,
} from "./VideoRoom.styles";
import { Participant } from "../../types";

interface ParticipantsListProps {
  participants: Participant[];
  collapsed?: boolean;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  collapsed = false,
}) => {
  return (
    <ParticipantsSider width={300} collapsible={false} collapsed={collapsed}>
      <ParticipantsSiderContent>
        <ParticipantListTitle>
          Participants ({participants.length})
        </ParticipantListTitle>

        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {participants.map((participant) => (
            <ParticipantCard key={participant.id} size="small">
              <ParticipantCard.Meta
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
                      status={participant.audioEnabled ? "success" : "error"}
                      text={participant.audioEnabled ? "Audio on" : "Muted"}
                    />
                    <Badge
                      status={participant.videoEnabled ? "success" : "error"}
                      text={participant.videoEnabled ? "Video on" : "Video off"}
                    />
                  </Space>
                }
              />
            </ParticipantCard>
          ))}
        </Space>
      </ParticipantsSiderContent>
    </ParticipantsSider>
  );
};

export default ParticipantsList;
