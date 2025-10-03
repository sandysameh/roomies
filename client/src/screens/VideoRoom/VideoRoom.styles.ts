import styled from "styled-components";
import { Layout, Card, Button, Typography } from "antd";
import {
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  BREAKPOINTS,
  ANIMATION,
  Z_INDEX,
} from "../../styles";

const { Header: AntHeader, Content: AntContent, Sider: AntSider } = Layout;
const { Text: AntText } = Typography;

// Main Layout
export const VideoRoomLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden;
`;

// Header
export const VideoRoomHeader = styled(AntHeader)`
  background: #001529;
  padding: 0 ${SPACING.xxl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  z-index: ${Z_INDEX.sticky};

  @media (max-width: ${BREAKPOINTS.md}) {
    padding: 0 ${SPACING.lg};
  }

  @media (max-width: ${BREAKPOINTS.sm}) {
    padding: 0 ${SPACING.md};
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.md};
  flex: 1;
  min-width: 0;

  /* Hide button text on mobile, keep icon only */
  @media (max-width: ${BREAKPOINTS.sm}) {
    .ant-btn-text span:not(.anticon) {
      display: none;
    }
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  align-items: center;

  @media (max-width: ${BREAKPOINTS.sm}) {
    gap: ${SPACING.md};
  }
`;

export const RoomTitle = styled.h4`
  margin: 0;
  color: white;
  font-size: ${FONT_SIZES.lg};
  font-weight: ${FONT_WEIGHTS.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: ${BREAKPOINTS.md}) {
    font-size: ${FONT_SIZES.md};
  }

  @media (max-width: ${BREAKPOINTS.sm}) {
    font-size: ${FONT_SIZES.base};
    max-width: 150px;
  }
`;

export const ParticipantCount = styled.span`
  display: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: ${FONT_SIZES.sm};
  font-weight: ${FONT_WEIGHTS.normal};
  margin-left: ${SPACING.sm};
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: ${BORDER_RADIUS.sm};

  @media (max-width: ${BREAKPOINTS.md}) {
    display: inline-block;
  }
`;

// Call Controls
export const CallControlsContainer = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  align-items: center;

  @media (max-width: ${BREAKPOINTS.sm}) {
    gap: ${SPACING.md};
  }
`;

export const ControlButton = styled(Button)<{ $isActive?: boolean }>`
  &.ant-btn {
    border-radius: ${BORDER_RADIUS.full};
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${ANIMATION.duration.normal} ${ANIMATION.easing.easeInOut};

    @media (max-width: ${BREAKPOINTS.sm}) {
      width: 40px;
      height: 40px;
    }

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

// Content Area
export const VideoContent = styled(AntContent)<{ $participantCount: number }>`
  padding: ${(props) => (props.$participantCount === 1 ? "0" : SPACING.lg)};
  background: #0f0f0f;
  overflow: hidden;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.md}) {
    padding: ${(props) => (props.$participantCount === 1 ? "0" : SPACING.md)};
  }

  @media (max-width: ${BREAKPOINTS.sm}) {
    padding: ${(props) => (props.$participantCount === 1 ? "0" : SPACING.sm)};
  }
`;

// Video Grid
export const VideoGrid = styled.div<{
  $columns: string;
  $rows: string;
  $isFullscreen: boolean;
}>`
  height: ${(props) =>
    props.$isFullscreen ? "calc(100vh - 64px)" : "calc(100vh - 96px)"};
  display: grid;
  grid-template-columns: ${(props) => props.$columns};
  grid-template-rows: ${(props) => props.$rows};
  gap: ${(props) => (props.$isFullscreen ? "0" : SPACING.md)};
  padding: ${(props) => (props.$isFullscreen ? "0" : SPACING.md)};
  border-radius: ${(props) => (props.$isFullscreen ? "0" : BORDER_RADIUS.md)};

  @media (max-width: ${BREAKPOINTS.md}) {
    gap: ${(props) => (props.$isFullscreen ? "0" : SPACING.sm)};
    padding: ${(props) => (props.$isFullscreen ? "0" : SPACING.sm)};
    height: ${(props) =>
      props.$isFullscreen ? "calc(100vh - 64px)" : "calc(100vh - 88px)"};
  }

  @media (max-width: ${BREAKPOINTS.sm}) {
    /* Single column layout on mobile - videos stack vertically */
    grid-template-columns: 1fr !important;
    grid-template-rows: auto !important;
    gap: ${SPACING.sm};
    overflow-y: auto;
    height: calc(100vh - 64px);
    padding: ${SPACING.sm};
  }
`;

// Participant Video Container
export const ParticipantVideoContainer = styled.div<{ $isFullscreen: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  border-radius: ${(props) => (props.$isFullscreen ? "0" : BORDER_RADIUS.lg)};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${ANIMATION.duration.normal} ${ANIMATION.easing.easeInOut};
  border: none;
  box-shadow: ${(props) =>
    props.$isFullscreen ? "none" : "0 2px 8px rgba(0,0,0,0.15)"};

  @media (max-width: ${BREAKPOINTS.sm}) {
    /* Mobile: Each video tile takes full width and has fixed aspect ratio */
    min-height: 280px;
    max-height: 400px;
    aspect-ratio: 16/9;
    border-radius: ${BORDER_RADIUS.md};
    cursor: default;
  }

  &:hover {
    transform: ${(props) => (props.$isFullscreen ? "none" : "scale(1.02)")};
    box-shadow: ${(props) =>
      props.$isFullscreen ? "none" : "0 4px 16px rgba(0,0,0,0.25)"};

    @media (max-width: ${BREAKPOINTS.sm}) {
      /* Disable hover effects on mobile */
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
`;

export const VideoElement = styled.video<{
  $isVisible: boolean;
  $isFullscreen: boolean;
}>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: ${(props) => (props.$isVisible ? "block" : "none")};
  transform: scaleX(-1);
  border-radius: ${(props) => (props.$isFullscreen ? "0" : BORDER_RADIUS.lg)};

  @media (max-width: ${BREAKPOINTS.sm}) {
    border-radius: ${BORDER_RADIUS.md};
  }
`;

export const VideoDisabledOverlay = styled.div<{ $isFullscreen: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2a2a2a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => (props.$isFullscreen ? "0" : BORDER_RADIUS.lg)};

  @media (max-width: ${BREAKPOINTS.sm}) {
    border-radius: ${BORDER_RADIUS.md};
  }
`;

export const ParticipantInfoOverlay = styled.div<{ $isFullscreen: boolean }>`
  position: absolute;
  bottom: ${(props) => (props.$isFullscreen ? SPACING.lg : SPACING.md)};
  left: ${(props) => (props.$isFullscreen ? SPACING.lg : SPACING.md)};
  right: ${(props) => (props.$isFullscreen ? SPACING.lg : SPACING.md)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  padding: ${(props) => (props.$isFullscreen ? "8px 12px" : "6px 8px")};
  border-radius: ${BORDER_RADIUS.md};
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: ${BREAKPOINTS.sm}) {
    bottom: ${SPACING.sm};
    left: ${SPACING.sm};
    right: ${SPACING.sm};
    padding: ${SPACING.xs} ${SPACING.sm};
  }
`;

export const ParticipantName = styled(AntText)<{ $isFullscreen: boolean }>`
  &.ant-typography {
    color: white;
    font-size: ${(props) =>
      props.$isFullscreen ? FONT_SIZES.base : FONT_SIZES.sm};
    font-weight: ${FONT_WEIGHTS.medium};

    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZES.xs};
    }
  }
`;

export const ParticipantStatusIcons = styled.div`
  display: flex;
  gap: ${SPACING.xs};
  align-items: center;
`;

// Empty State
export const EmptyStateOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: ${Z_INDEX.sticky};
  background: rgba(0, 0, 0, 0.7);
  padding: ${SPACING.xxl} ${SPACING.xxxl};
  border-radius: ${BORDER_RADIUS.lg};
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: ${BREAKPOINTS.sm}) {
    padding: ${SPACING.lg} ${SPACING.xl};
    width: 90%;
    max-width: 300px;
  }
`;

export const EmptyStateText = styled(AntText)`
  &.ant-typography {
    color: white;
    font-size: ${FONT_SIZES.md};

    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZES.base};
    }
  }
`;

// Participants Sidebar
export const ParticipantsSider = styled(AntSider)`
  &.ant-layout-sider {
    background: white;

    @media (max-width: ${BREAKPOINTS.md}) {
      display: none;
    }
  }
`;

export const ParticipantsSiderContent = styled.div`
  padding: ${SPACING.xxl};

  @media (max-width: ${BREAKPOINTS.md}) {
    padding: ${SPACING.lg};
  }

  @media (max-width: ${BREAKPOINTS.sm}) {
    padding: ${SPACING.md};
  }
`;

export const ParticipantListTitle = styled.h5`
  margin: 0 0 ${SPACING.lg} 0;
  font-size: ${FONT_SIZES.md};
  font-weight: ${FONT_WEIGHTS.semibold};

  @media (max-width: ${BREAKPOINTS.sm}) {
    font-size: ${FONT_SIZES.base};
  }
`;

export const ParticipantCard = styled(Card)`
  &.ant-card {
    width: 100%;
    margin-bottom: ${SPACING.md};
    border-radius: ${BORDER_RADIUS.md};
    transition: all ${ANIMATION.duration.normal} ${ANIMATION.easing.easeInOut};

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: ${BREAKPOINTS.sm}) {
      margin-bottom: ${SPACING.sm};
    }
  }
`;

// Loading State
export const LoadingContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #0f0f0f;
`;

export const LoadingText = styled(AntText)`
  &.ant-typography {
    margin-top: ${SPACING.lg};
    font-size: ${FONT_SIZES.md};
    color: white;
  }
`;
