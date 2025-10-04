import styled from "styled-components";
import { Card, Typography } from "antd";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "../../styles";

const { Title, Text } = Typography;

export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${COLORS.primary.gradient};
  padding: ${SPACING.xxxl};
`;

export const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 ${SPACING.sm} ${SPACING.xxxl} ${COLORS.shadow.primary};
  border-radius: ${BORDER_RADIUS.xl};

  .ant-card-body {
    padding: ${SPACING.xxxxxl};
  }
`;

export const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: ${SPACING.xxxl};
`;

export const LogoIcon = styled.div`
  font-size: ${FONT_SIZES.xxxxxl};
  color: ${COLORS.primary.main};
  margin-bottom: ${SPACING.lg};
`;

export const AppTitle = styled(Title)`
  &.ant-typography {
    margin: 0;
    color: ${COLORS.text.primary};
  }
`;

export const AppSubtitle = styled(Text)`
  &.ant-typography {
    font-size: ${FONT_SIZES.md};
    color: ${COLORS.text.secondary};
  }
`;

export const AccountTypeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.sm} ${SPACING.md};
  background: ${COLORS.background.secondary};
  border-radius: ${BORDER_RADIUS.md};
  border: 1px solid ${COLORS.border.secondary};
`;

export const AccountTypeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;
