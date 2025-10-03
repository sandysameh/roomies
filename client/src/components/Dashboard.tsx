import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Daily from "@daily-co/daily-js";
import {
  Layout,
  Card,
  Button,
  Typography,
  Space,
  Badge,
  Modal,
  Form,
  Input,
  message,
  Avatar,
  Dropdown,
  MenuProps,
  Empty,
  Spin,
  App,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { roomsAPI } from "../services/api";
import { Room } from "../types";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const callObjectRef = useRef<any>(null);

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

  useEffect(() => {
    console.log("Current user:", user);
    console.log("Is admin:", user?.isAdmin);
  }, [user]);

  const handleCreateRoom = async (values: { name: string }) => {
    setCreateLoading(true);
    try {
      const response = await roomsAPI.createRoom(values);
      if (response.success) {
        message.success("Room created successfully!");
        setCreateModalVisible(false);
        form.resetFields();
        fetchRooms(); // Refresh the room list
      }
    } catch (error: any) {
      console.error("Error creating room:", error);
      message.error(error.response?.data?.error || "Failed to create room");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRoom = async (roomName: string) => {
    try {
      message.loading("Joining room...", 2);

      // First, get room details from backend
      const joinResponse = await roomsAPI.joinRoom(roomName);
      console.log("Backend join response:", joinResponse);

      if (!joinResponse.success) {
        throw new Error("Failed to join room");
      }

      // Clean up any existing call object
      if (callObjectRef.current) {
        try {
          await callObjectRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying existing call object:", e);
        }
        callObjectRef.current = null;
      }

      // Create Daily call object and join
      const call = Daily.createCallObject();
      callObjectRef.current = call;

      await call.join({
        url: joinResponse.room.url,
        token: localStorage.getItem("token") || "", // Use the token from the join response
        userName: user?.name || user?.email || "User",
        startVideoOff: true, // Start with video off so user can control it
        startAudioOff: false, // Start with audio on
      });

      // Store call object globally so VideoRoom can access it
      (window as any).dailyCallObject = call;

      // Navigate to room with success (don't pass call object in state)
      navigate(`/room/${roomName}`, {
        state: {
          roomData: joinResponse.room,
          token: joinResponse.token,
        },
      });

      message.success(`Joined room: ${roomName}`);
    } catch (error: any) {
      console.error("Error joining room:", error);
      message.error("Failed to join room");

      // Clean up on error
      if (callObjectRef.current) {
        try {
          await callObjectRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying call object after error:", e);
        }
        callObjectRef.current = null;
      }
    }
  };

  const handleDeleteRoom = async (roomName: string) => {
    console.log("Delete room clicked for:", roomName);
    console.log("User is admin:", user?.isAdmin);

    modal.error({
      title: "Delete Room",
      content:
        "Are you sure you want to delete this room? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await roomsAPI.deleteRoom(roomName);
          message.success("Room deleted successfully");
          fetchRooms();
        } catch (error: any) {
          message.error(error.response?.data?.error || "Failed to delete room");
        }
      },
    });
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: `${user?.name} ${user?.isAdmin ? "(Admin)" : ""}`,
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <VideoCameraOutlined
            style={{ fontSize: "24px", color: "#667eea", marginRight: "12px" }}
          />
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
            Roomies
          </Title>
        </div>

        <Space>
          {user?.isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              Create Room
            </Button>
          )}

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button
              type="text"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Avatar icon={<UserOutlined />} style={{ marginRight: "8px" }} />
              <span>{user?.name}</span>
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "24px" }}>
            <Title level={2}>Available Rooms</Title>
            <Text type="secondary">
              {user?.isAdmin
                ? "Create new rooms or join existing ones"
                : "Join any available room to start video calling"}
            </Text>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Spin size="large" />
            </div>
          ) : rooms.length === 0 ? (
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
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  Create First Room
                </Button>
              )}
            </Empty>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  hoverable
                  style={{ borderRadius: "12px" }}
                  actions={[
                    <Button
                      key="join"
                      type="primary"
                      icon={<VideoCameraOutlined />}
                      onClick={() => handleJoinRoom(room.name)}
                      style={{ width: "80%" }}
                    >
                      Join Room
                    </Button>,
                    ...(user?.isAdmin
                      ? [
                          <Button
                            key="delete"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Delete button clicked!");
                              handleDeleteRoom(room.name);
                            }}
                            title="Delete Room"
                            style={{
                              color: "#ff4d4f",
                              fontSize: "16px",
                            }}
                          >
                            Delete
                          </Button>,
                        ]
                      : []),
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: "#667eea" }}
                        icon={<VideoCameraOutlined />}
                      />
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ textTransform: "capitalize" }}>
                          {room.name.replace(/-/g, " ")}
                        </span>
                        <Badge
                          count={room.participantCount}
                          style={{
                            backgroundColor:
                              room.participantCount > 0 ? "#52c41a" : "#d9d9d9",
                          }}
                          title={`${room.participantCount} participant(s)`}
                        />
                      </div>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <TeamOutlined
                            style={{ marginRight: "6px", color: "#666" }}
                          />
                          <Text type="secondary">
                            {room.participantCount === 0
                              ? "No participants"
                              : `${room.participantCount} participant${
                                  room.participantCount > 1 ? "s" : ""
                                }`}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {new Date(room.createdAt).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              ))}
            </div>
          )}
        </div>
      </Content>

      {/* Create Room Modal */}
      <Modal
        title="Create New Room"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRoom}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            name="name"
            label="Room Name"
            rules={[
              { required: true, message: "Please enter a room name" },
              { min: 3, message: "Room name must be at least 3 characters" },
              { max: 50, message: "Room name must be less than 50 characters" },
              {
                pattern: /^[a-zA-Z0-9\s-_]+$/,
                message:
                  "Room name can only contain letters, numbers, spaces, hyphens, and underscores",
              },
            ]}
          >
            <Input
              placeholder="Enter room name (e.g., Team Meeting, Daily Standup)"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                Create Room
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
