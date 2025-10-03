import React from "react";
import { UserOutlined } from "@ant-design/icons";
import {
  VideoGrid as StyledVideoGrid,
  EmptyStateOverlay,
  EmptyStateText,
} from "./VideoRoom.styles";
import ParticipantVideo from "./ParticipantVideo";
import { getGridLayout } from "./utils";
import { Participant } from "../../types";

interface VideoGridProps {
  participants: Participant[];
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  videoRefs: React.RefObject<Map<string, HTMLVideoElement>>;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  localVideoRef,
  videoRefs,
}) => {
  const participantCount = participants.length;
  const isFullscreen = participantCount === 1;
  const gridLayout = getGridLayout(participantCount);

  const localParticipant = participants.find((p) => p.isLocal);
  const remoteParticipants = participants.filter((p) => !p.isLocal);

  const handleVideoRef =
    (participant: Participant) => (el: HTMLVideoElement | null) => {
      if (el) {
        if (participant.isLocal) {
          localVideoRef.current = el;
        } else {
          videoRefs.current.set(participant.id, el);
        }
      }
    };

  return (
    <StyledVideoGrid
      $columns={gridLayout.columns}
      $rows={gridLayout.rows}
      $isFullscreen={isFullscreen}
    >
      {/* Local participant video */}
      {localParticipant && (
        <ParticipantVideo
          participant={localParticipant}
          videoRef={handleVideoRef(localParticipant)}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Remote participants videos */}
      {remoteParticipants.map((participant) => (
        <ParticipantVideo
          key={participant.id}
          participant={participant}
          videoRef={handleVideoRef(participant)}
          isFullscreen={isFullscreen}
        />
      ))}

      {/* Empty state when alone */}
      {participantCount === 1 && (
        <EmptyStateOverlay>
          <UserOutlined
            style={{
              fontSize: "64px",
              color: "#666",
              marginBottom: "16px",
              display: "block",
            }}
          />
          <EmptyStateText>Waiting for others to join...</EmptyStateText>
        </EmptyStateOverlay>
      )}
    </StyledVideoGrid>
  );
};

export default VideoGrid;
