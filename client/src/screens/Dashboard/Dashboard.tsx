import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, message, Empty, Spin, App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useRoomManagement } from "../../hooks/useRoomManagement";
import { roomsAPI } from "../../services/api";
import { Room } from "../../types";
import { PrimaryButton } from "../../components/PrimaryButton";
import DashboardHeader from "./DashboardHeader";
import RoomCard from "./RoomCard";
import CreateRoomModal from "./CreateRoomModal";
import {
  DashboardLayout,
  Content,
  ContentContainer,
  ContentHeader,
  ContentTitle,
  ContentDescription,
  LoadingContainer,
  EmptyContainer,
  RoomsGrid,
} from "./Dashboard.styles";

const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { user, logout } = useAuth();
  const {
    createLoading,
    handleCreateRoom,
    handleRouteToRoom,
    handleDeleteRoom,
  } = useRoomManagement();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { modal } = App.useApp();

  const fetchRooms = async (showLoading = false) => {
    try {
      if (showLoading) {
        setInitialLoading(true);
      }
      const response = await roomsAPI.getRooms();
      if (response.success) {
        setRooms(response.rooms);
      }
    } catch (error: any) {
      console.error("Error fetching rooms:", error);
      if (showLoading) {
        message.error("Failed to load rooms");
      }
    } finally {
      if (showLoading) {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRooms(true);
    const interval = setInterval(() => fetchRooms(false), 20000);
    return () => clearInterval(interval);
  }, []);

  const onCreateRoom = async (values: { name: string }) => {
    const result = await handleCreateRoom(values);
    if (result.success) {
      setCreateModalVisible(false);
      form.resetFields();
      fetchRooms(false); // Refresh without loading spinner
    }
  };

  const onJoinRoom = async (roomName: string) => {
    await handleRouteToRoom(roomName);
  };

  const onDeleteRoom = async (roomName: string) => {
    modal.error({
      title: "Delete Room",
      content:
        "Are you sure you want to delete this room? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const result = await handleDeleteRoom(roomName);
        if (result.success) {
          fetchRooms(false); // Refresh without loading spinner
        }
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenCreateModal = () => {
    setCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    form.resetFields();
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        user={user}
        onCreateRoom={handleOpenCreateModal}
        onLogout={handleLogout}
      />

      <Content>
        <ContentContainer>
          <ContentHeader>
            <ContentTitle level={2}>Available Rooms</ContentTitle>
            <ContentDescription type="secondary">
              {rooms.length > 0 && (
                <div>
                  <b>
                    PS: The Number of Participants in the Room Take time to
                    update
                  </b>
                </div>
              )}
              {user?.isAdmin
                ? "Create new rooms or join existing ones"
                : "Join any available room to start video calling"}
            </ContentDescription>
          </ContentHeader>

          {initialLoading ? (
            <LoadingContainer>
              <Spin size="large" />
            </LoadingContainer>
          ) : rooms.length === 0 ? (
            <EmptyContainer>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    No rooms available yet.
                    {user?.isAdmin && " Create the first room to get started!"}
                  </span>
                }
              >
                {user?.isAdmin && (
                  <PrimaryButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreateModal}
                  >
                    Create First Room
                  </PrimaryButton>
                )}
              </Empty>
            </EmptyContainer>
          ) : (
            <RoomsGrid>
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isAdmin={user?.isAdmin || false}
                  onJoinRoom={onJoinRoom}
                  onDeleteRoom={onDeleteRoom}
                />
              ))}
            </RoomsGrid>
          )}
        </ContentContainer>
      </Content>

      <CreateRoomModal
        visible={createModalVisible}
        loading={createLoading}
        form={form}
        onCancel={handleCloseCreateModal}
        onSubmit={onCreateRoom}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
