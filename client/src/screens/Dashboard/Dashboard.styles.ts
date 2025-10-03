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
} from "../../styles";

const { Header: AntHeader, Content: AntContent } = Layout;
const { Title: AntTitle, Text: AntText } = Typography;

// Main Layout Components
export const DashboardLayout = styled(Layout)<{
  width?: string;
  height?: string;
}>`
  min-height: ${(props) => props.height || "100vh"};
  width: ${(props) => props.width || "100%"};
  background: ${COLORS.background.secondary};
`;

export const Header = styled(AntHeader)<{ width?: string; height?: string }>`
  background: ${COLORS.background.primary};
  padding: 0 ${SPACING.xxl};
  box-shadow: 0 2px 8px ${COLORS.shadow.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || LAYOUT_SIZES.header.height};
`;

export const Content = styled(AntContent)<{ width?: string; height?: string }>`
  padding: ${SPACING.xxl};
  width: ${(props) => props.width || "100%"};
  min-height: ${(props) =>
    props.height || `calc(100vh - ${LAYOUT_SIZES.header.height})`};
`;

// Header Components
export const LogoContainer = styled.div<{ width?: string; height?: string }>`
  display: flex;
  align-items: center;
  width: ${(props) => props.width || "auto"};
  height: ${(props) => props.height || "100%"};
`;

export const LogoIcon = styled.div<{ width?: string; height?: string }>`
  font-size: ${FONT_SIZES.xxl};
  color: ${COLORS.primary.main};
  margin-right: ${SPACING.md};
  width: ${(props) => props.width || FONT_SIZES.xxl};
  height: ${(props) => props.height || FONT_SIZES.xxl};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Title = styled(AntTitle)<{ width?: string; height?: string }>`
  &.ant-typography {
    margin: 0;
    color: ${COLORS.text.primary};
    width: ${(props) => props.width || "auto"};
    height: ${(props) => props.height || "auto"};
  }
`;

export const HeaderActions = styled.div<{ width?: string; height?: string }>`
  display: flex;
  align-items: center;
  gap: ${SPACING.lg};
  width: ${(props) => props.width || "auto"};
  height: ${(props) => props.height || "100%"};
`;

export const UserButton = styled(Button)<{ width?: string; height?: string }>`
  &.ant-btn {
    display: flex;
    align-items: center;
    width: ${(props) => props.width || "auto"};
    height: ${(props) => props.height || "32px"};
  }
`;

export const UserAvatar = styled(Avatar)<{ width?: string; height?: string }>`
  margin-right: 8px;
  width: ${(props) => props.width || "32px"};
  height: ${(props) => props.height || "32px"};
`;

// Content Components
export const ContentContainer = styled.div<{ width?: string; height?: string }>`
  max-width: 1200px;
  margin: 0 auto;
  width: ${(props) => props.width || "100%"};
  min-height: ${(props) => props.height || "auto"};
`;

export const ContentHeader = styled.div<{ width?: string; height?: string }>`
  margin-bottom: 24px;
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

export const ContentTitle = styled(AntTitle)<{
  width?: string;
  height?: string;
}>`
  &.ant-typography {
    width: ${(props) => props.width || "100%"};
    height: ${(props) => props.height || "auto"};
  }
`;

export const ContentDescription = styled(AntText)<{
  width?: string;
  height?: string;
  fontSize?: string;
  fontWeight?: string | number;
  color?: string;
}>`
  &.ant-typography {
    width: ${(props) => props.width || "100%"};
    height: ${(props) => props.height || "auto"};
    font-size: ${(props) => props.fontSize || FONT_SIZES.base};
    font-weight: ${(props) => props.fontWeight || FONT_WEIGHTS.normal};
    color: ${(props) => props.color || COLORS.text.secondary};
  }
`;

// Loading and Empty States
export const LoadingContainer = styled.div<{ width?: string; height?: string }>`
  text-align: center;
  padding: ${SPACING.xxxxxxl};
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

export const EmptyContainer = styled.div<{ width?: string; height?: string }>`
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

// Room Grid
export const RoomsGrid = styled.div<{ width?: string; height?: string }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(${LAYOUT_SIZES.card.minWidth}, 1fr)
  );
  gap: ${SPACING.xxl};
  width: ${(props) => props.width || "100%"};
  min-height: ${(props) => props.height || "auto"};
`;

// Room Card Components
export const RoomCard = styled(Card)<{ width?: string; height?: string }>`
  &.ant-card {
    border-radius: ${BORDER_RADIUS.lg};
    width: ${(props) => props.width || "100%"};
    height: ${(props) => props.height || "auto"};
  }
`;

export const RoomCardMeta = styled.div<{ width?: string; height?: string }>`
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

export const RoomAvatar = styled(Avatar)<{ width?: string; height?: string }>`
  background-color: ${COLORS.primary.main};
  width: ${(props) => props.width || "40px"};
  height: ${(props) => props.height || "40px"};
`;

export const RoomTitleContainer = styled.div<{
  width?: string;
  height?: string;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

export const RoomTitle = styled.span<{ width?: string; height?: string }>`
  text-transform: capitalize;
  width: ${(props) => props.width || "auto"};
  height: ${(props) => props.height || "auto"};
`;

export const RoomDescription = styled.div<{ width?: string; height?: string }>`
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

export const ParticipantInfo = styled.div<{ width?: string; height?: string }>`
  display: flex;
  align-items: center;
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

export const ParticipantIcon = styled.div<{ width?: string; height?: string }>`
  margin-right: ${SPACING.xs};
  color: ${COLORS.text.tertiary};
  width: ${(props) => props.width || COMPONENT_SIZES.icon.small};
  height: ${(props) => props.height || COMPONENT_SIZES.icon.small};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ParticipantText = styled(AntText)<{
  width?: string;
  height?: string;
  fontSize?: string;
  fontWeight?: string | number;
  color?: string;
}>`
  &.ant-typography {
    width: ${(props) => props.width || "auto"};
    height: ${(props) => props.height || "auto"};
    font-size: ${(props) => props.fontSize || FONT_SIZES.base};
    font-weight: ${(props) => props.fontWeight || FONT_WEIGHTS.normal};
    color: ${(props) => props.color || COLORS.text.secondary};
  }
`;

export const RoomDate = styled(AntText)<{
  width?: string;
  height?: string;
  fontSize?: string;
  fontWeight?: string | number;
  color?: string;
}>`
  &.ant-typography {
    width: ${(props) => props.width || "auto"};
    height: ${(props) => props.height || "auto"};
    font-size: ${(props) => props.fontSize || FONT_SIZES.sm};
    font-weight: ${(props) => props.fontWeight || FONT_WEIGHTS.normal};
    color: ${(props) => props.color || COLORS.text.secondary};
  }
`;

export const DeleteButton = styled(Button)<{ width?: string; height?: string }>`
  &.ant-btn {
    color: ${COLORS.error.main};
    font-size: ${FONT_SIZES.md};
    width: ${(props) => props.width || "auto"};
    height: ${(props) => props.height || COMPONENT_SIZES.button.medium.height};
  }
`;

// Modal Components
export const ModalForm = styled.div<{ width?: string; height?: string }>`
  margin-top: ${SPACING.xl};
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

export const ModalActions = styled.div<{ width?: string; height?: string }>`
  width: 100%;
  justify-content: flex-end;
  margin-bottom: 0;
  margin-top: ${SPACING.xxl};
  display: flex;
  gap: ${SPACING.sm};
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
`;

export const CancelButton = styled(Button)<{ width?: string; height?: string }>`
  &.ant-btn {
    width: ${(props) => props.width || "auto"};
    height: ${(props) => props.height || COMPONENT_SIZES.button.medium.height};
  }
`;
