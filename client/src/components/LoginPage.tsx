import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Switch,
  Card,
  Typography,
  message,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { LoginRequest } from "../types";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values);

      if (response.success) {
        login(response.user, response.token);
        message.success(
          `Welcome ${response.user.name}! ${
            response.user.isAdmin ? "(Admin)" : ""
          }`
        );
        navigate("/dashboard");
      } else {
        message.error("Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      message.error(
        error.response?.data?.error || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          borderRadius: "16px",
        }}
        bodyStyle={{ padding: "40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <VideoCameraOutlined
            style={{
              fontSize: "48px",
              color: "#667eea",
              marginBottom: "16px",
            }}
          />
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Roomies
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Connect with your team through video
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isAdmin: false }}
          size="large"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter your name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="isAdmin"
            valuePropName="checked"
            style={{ marginBottom: "32px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <Space direction="vertical" size={0}>
                <Text strong>Account Type</Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {form.getFieldValue("isAdmin")
                    ? "Admin - Can create rooms"
                    : "Regular User - Can join rooms"}
                </Text>
              </Space>
              <Switch
                checkedChildren="Admin"
                unCheckedChildren="User"
                onChange={(checked) => {
                  form.setFieldsValue({ isAdmin: checked });
                }}
              />
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: "48px",
                fontSize: "16px",
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "8px",
              }}
            >
              {loading ? "Signing In..." : "Sign In to Roomies"}
            </Button>
          </Form.Item>
        </Form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            padding: "16px",
            background: "#f0f9ff",
            borderRadius: "8px",
            border: "1px solid #e0f2fe",
          }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            🔒 This is a demo app. Any credentials will be accepted for login.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
