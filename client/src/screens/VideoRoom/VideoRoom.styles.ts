import styled from "styled-components";
import { Layout, Card, Button, Typography } from "antd";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  LAYOUT_SIZES,
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
  background: ${COLORS.neutral.gray900};
  padding: 0 ${SPACING.xxl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${LAYOUT_SIZES.header.height};
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
  color: ${COLORS.neutral.white};
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
  color: ${COLORS.text.inverseLight};
  font-size: ${FONT_SIZES.sm};
  font-weight: ${FONT_WEIGHTS.normal};
  margin-left: ${SPACING.sm};
  background: ${COLORS.background.overlayLight};
  padding: ${SPACING.xs} ${SPACING.sm};
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
    width: ${SPACING.xxxxxl};
    height: ${SPACING.xxxxxl};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${ANIMATION.duration.normal} ${ANIMATION.easing.easeInOut};

    @media (max-width: ${BREAKPOINTS.sm}) {
      width: ${SPACING.xxxxl};
      height: ${SPACING.xxxxl};
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
  background: ${COLORS.neutral.black};
  overflow: hidden;

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
    props.$isFullscreen
      ? `calc(100vh - ${LAYOUT_SIZES.header.height})`
      : `calc(100vh - ${LAYOUT_SIZES.header.height} - ${SPACING.xxxl})`};
  display: grid;
  grid-template-columns: ${(props) => props.$columns};
  grid-template-rows: ${(props) => props.$rows};
  gap: ${(props) => (props.$isFullscreen ? "0" : SPACING.md)};
  padding: ${(props) => (props.$isFullscreen ? "0" : SPACING.md)};
  border-radius: ${(props) => (props.$isFullscreen ? "0" : BORDER_RADIUS.md)};

  @media (max-width: ${BREAKPOINTS.md}) {
    gap: ${(props) => (props.$isFullscreen ? "0" : SPACING.sm)};
    padding: ${(props) => (props.$isFullscreen ? "0" : SPACING.sm)};
  }

  @media (max-width: ${BREAKPOINTS.sm}) {
    grid-template-columns: 1fr !important;
    grid-template-rows: auto !important;
    gap: ${SPACING.sm};
    overflow-y: auto;
    height: calc(100vh - ${LAYOUT_SIZES.header.height});
    padding: ${SPACING.sm};
  }
`;

// Participant Video Container
export const ParticipantVideoContainer = styled.div<{ $isFullscreen: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: ${COLORS.neutral.gray800};
  border-radius: ${(props) => (props.$isFullscreen ? "0" : BORDER_RADIUS.lg)};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${ANIMATION.duration.normal} ${ANIMATION.easing.easeInOut};
  box-shadow: ${(props) =>
    props.$isFullscreen
      ? "none"
      : `0 ${SPACING.xs} ${SPACING.sm} ${COLORS.shadow.primary}`};

  @media (max-width: ${BREAKPOINTS.sm}) {
    min-height: 280px;
    max-height: 400px;
    aspect-ratio: 16/9;
    border-radius: ${BORDER_RADIUS.md};
    cursor: default;
  }

  &:hover {
    transform: ${(props) => (props.$isFullscreen ? "none" : "scale(1.02)")};
    box-shadow: ${(props) =>
      props.$isFullscreen
        ? "none"
        : `0 ${SPACING.xs} ${SPACING.lg} ${COLORS.shadow.hover}`};

    @media (max-width: ${BREAKPOINTS.sm}) {
      transform: none;
      box-shadow: 0 ${SPACING.xs} ${SPACING.sm} ${COLORS.shadow.primary};
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
  background-color: ${COLORS.neutral.gray700};
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
  background: ${COLORS.background.overlayDark};
  padding: ${(props) =>
    props.$isFullscreen ? `${SPACING.sm} ${SPACING.md}` : SPACING.sm};
  border-radius: ${BORDER_RADIUS.md};
  backdrop-filter: blur(${SPACING.xs});
  border: 1px solid ${COLORS.border.light};

  @media (max-width: ${BREAKPOINTS.sm}) {
    bottom: ${SPACING.sm};
    left: ${SPACING.sm};
    right: ${SPACING.sm};
    padding: ${SPACING.xs} ${SPACING.sm};
  }
`;

export const ParticipantName = styled(AntText)<{ $isFullscreen: boolean }>`
  &.ant-typography {
    color: ${COLORS.neutral.white};
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
  background: ${COLORS.background.overlayDark};
  padding: ${SPACING.xxl} ${SPACING.xxxl};
  border-radius: ${BORDER_RADIUS.lg};
  backdrop-filter: blur(${SPACING.sm});
  border: 1px solid ${COLORS.border.light};

  @media (max-width: ${BREAKPOINTS.sm}) {
    padding: ${SPACING.lg} ${SPACING.xl};
    width: 90%;
    max-width: 300px;
  }
`;

export const EmptyStateText = styled(AntText)`
  &.ant-typography {
    color: ${COLORS.neutral.white};
    font-size: ${FONT_SIZES.md};

    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZES.base};
    }
  }
`;

// Participants Sidebar
export const ParticipantsSider = styled(AntSider)`
  &.ant-layout-sider {
    background: ${COLORS.background.primary};

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
  color: ${COLORS.text.primary};

  @media (max-width: ${BREAKPOINTS.sm}) {
    font-size: ${FONT_SIZES.base};
  }
`;

export const ParticipantCard = styled(Card)`
  &.ant-card {
    margin-bottom: ${SPACING.md};
    border-radius: ${BORDER_RADIUS.md};
    transition: all ${ANIMATION.duration.normal} ${ANIMATION.easing.easeInOut};

    &:hover {
      box-shadow: 0 ${SPACING.xs} ${SPACING.sm} ${COLORS.shadow.primary};
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
  background: ${COLORS.neutral.black};
`;

export const LoadingText = styled(AntText)`
  &.ant-typography {
    margin-top: ${SPACING.lg};
    font-size: ${FONT_SIZES.md};
    color: ${COLORS.neutral.white};
  }
`;
