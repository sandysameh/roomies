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

interface DashboardProps {
  width?: string;
  height?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ width, height }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { user, logout } = useAuth();
  const { createLoading, handleCreateRoom, handleJoinRoom, handleDeleteRoom } =
    useRoomManagement();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { modal } = App.useApp();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getRooms();
      if (response.success) {
        setRooms(response.rooms);
      }
    } catch (error: any) {
      console.error("Error fetching rooms:", error);
      message.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // Refresh room list every 30 seconds to update participant counts
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  const onCreateRoom = async (values: { name: string }) => {
    const result = await handleCreateRoom(values);
    if (result.success) {
      setCreateModalVisible(false);
      form.resetFields();
      fetchRooms(); // Refresh the room list
    }
  };

  const onJoinRoom = async (roomName: string) => {
    await handleJoinRoom(roomName);
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
          fetchRooms();
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
    <DashboardLayout width={width} height={height}>
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
              {user?.isAdmin
                ? "Create new rooms or join existing ones"
                : "Join any available room to start video calling"}
            </ContentDescription>
          </ContentHeader>

          {loading ? (
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
