import styled from "styled-components";
import { Layout, Card, Button, Typography, Avatar } from "antd";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  LAYOUT_SIZES,
  COMPONENT_SIZES,
  BREAKPOINTS,
} from "../../styles";

const { Header: AntHeader, Content: AntContent } = Layout;
const { Title: AntTitle, Text: AntText } = Typography;

// Main Layout Components
export const DashboardLayout = styled(Layout)`
  min-height: 100vh;
  background: ${COLORS.background.secondary};
`;

export const Header = styled(AntHeader)`
  background: ${COLORS.background.primary};
  padding: 0 ${SPACING.xxl};
  box-shadow: 0 ${SPACING.xs} ${SPACING.sm} ${COLORS.shadow.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${LAYOUT_SIZES.header.height};

  @media (max-width: ${BREAKPOINTS.md}) {
    padding: 0 ${SPACING.md};
  }

  @media (max-width: ${BREAKPOINTS.xs}) {
    padding: 0 ${SPACING.sm};
  }
`;

export const Content = styled(AntContent)`
  padding: ${SPACING.xxl};
  min-height: calc(100vh - ${LAYOUT_SIZES.header.height});

  @media (max-width: ${BREAKPOINTS.md}) {
    padding: ${SPACING.lg};
  }

  @media (max-width: ${BREAKPOINTS.xs}) {
    padding: ${SPACING.md};
  }
`;

// Header Components
export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const LogoIcon = styled.div`
  font-size: ${FONT_SIZES.xxl};
  color: ${COLORS.primary.main};
  margin-right: ${SPACING.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Title = styled(AntTitle)`
  &.ant-typography {
    margin: 0;
    color: ${COLORS.text.primary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: ${BREAKPOINTS.md}) {
    &.ant-typography {
      font-size: ${FONT_SIZES.lg} !important;
    }
  }

  @media (max-width: ${BREAKPOINTS.xs}) {
    &.ant-typography {
      font-size: ${FONT_SIZES.md} !important;
    }
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.lg};
`;

export const UserButton = styled(Button)`
  &.ant-btn {
    display: flex;
    align-items: center;
    height: ${COMPONENT_SIZES.avatar.medium};
  }
`;

export const UserAvatar = styled(Avatar)`
  margin-right: ${SPACING.sm};
`;

// Content Components
export const ContentContainer = styled.div`
  max-width: ${LAYOUT_SIZES.container.maxWidth};
  margin: 0 auto;
`;

export const ContentHeader = styled.div`
  margin-bottom: ${SPACING.xxl};
`;

export const ContentTitle = styled(AntTitle)``;

export const ContentDescription = styled(AntText)`
  &.ant-typography {
    color: ${COLORS.text.secondary};
  }
`;

// Loading and Empty States
export const LoadingContainer = styled.div`
  text-align: center;
  padding: ${SPACING.xxxxxxl};
`;

export const EmptyContainer = styled.div``;

// Room Grid
export const RoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(${LAYOUT_SIZES.card.minWidth}, 1fr)
  );
  gap: ${SPACING.xxl};
`;

// Room Card Components
export const RoomCard = styled(Card)`
  &.ant-card {
    border-radius: ${BORDER_RADIUS.lg};
  }
`;

export const RoomCardMeta = styled.div``;

export const RoomAvatar = styled(Avatar)`
  background-color: ${COLORS.primary.main};
`;

export const RoomTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const RoomTitle = styled.span`
  text-transform: capitalize;
`;

export const RoomDescription = styled.div``;

export const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const ParticipantIcon = styled.div`
  margin-right: ${SPACING.xs};
  color: ${COLORS.text.tertiary};
  width: ${COMPONENT_SIZES.icon.small};
  height: ${COMPONENT_SIZES.icon.small};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ParticipantText = styled(AntText)`
  &.ant-typography {
    color: ${COLORS.text.secondary};
  }
`;

export const RoomDate = styled(AntText)`
  &.ant-typography {
    font-size: ${FONT_SIZES.sm};
    color: ${COLORS.text.secondary};
  }
`;

export const DeleteButton = styled(Button)`
  &.ant-btn {
    color: ${COLORS.error.main};
    font-size: ${FONT_SIZES.md};
    height: ${COMPONENT_SIZES.button.medium.height};
  }
`;

// Modal Components
export const ModalForm = styled.div`
  margin-top: ${SPACING.xl};
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.sm};
  margin-top: ${SPACING.xxl};
`;

export const CancelButton = styled(Button)`
  &.ant-btn {
    height: ${COMPONENT_SIZES.button.medium.height};
  }
`;
