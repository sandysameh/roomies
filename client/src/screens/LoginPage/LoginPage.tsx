import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, message } from "antd";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { LoginRequest } from "../../types";
import {
  LoginContainer,
  LoginCard,
  HeaderContainer,
  AppSubtitle,
  AppTitle,
  LogoIcon,
} from "./LoginPage.styles";
import { VideoCameraOutlined } from "@ant-design/icons";
import LoginForm from "./LoginForm";

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
    <LoginContainer>
      <LoginCard>
        <HeaderContainer>
          <LogoIcon>
            <VideoCameraOutlined />
          </LogoIcon>
          <AppTitle level={2}>Roomies</AppTitle>
          <AppSubtitle type="secondary">
            Connect with your team through video
          </AppSubtitle>
        </HeaderContainer>
        <LoginForm form={form} loading={loading} onSubmit={handleSubmit} />
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
