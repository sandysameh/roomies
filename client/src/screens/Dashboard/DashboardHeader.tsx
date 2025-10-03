import React from "react";
import { Space, Dropdown, MenuProps } from "antd";
import {
  PlusOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { AccountType } from "../../types";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  Header,
  LogoContainer,
  LogoIcon,
  Title,
  HeaderActions,
  UserButton,
  UserAvatar,
} from "./Dashboard.styles";

interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

interface DashboardHeaderProps {
  user: User;
  onCreateRoom: () => void;
  onLogout: () => void;
  width?: string;
  height?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onCreateRoom,
  onLogout,
  width,
  height,
}) => {
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: `${user?.name} ${user?.isAdmin ? `(${AccountType.ADMIN})` : ""}`,
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: onLogout,
    },
  ];

  return (
    <Header width={width} height={height}>
      <LogoContainer>
        <LogoIcon>
          <VideoCameraOutlined />
        </LogoIcon>
        <Title level={3}>Roomies</Title>
      </LogoContainer>

      <HeaderActions>
        <Space>
          {user?.isAdmin && (
            <PrimaryButton icon={<PlusOutlined />} onClick={onCreateRoom}>
              Create Room
            </PrimaryButton>
          )}

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <UserButton type="text">
              <UserAvatar icon={<UserOutlined />} />
              <span>{user?.name}</span>
            </UserButton>
          </Dropdown>
        </Space>
      </HeaderActions>
    </Header>
  );
};

export default DashboardHeader;
