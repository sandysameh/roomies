import React from "react";
import { Form, Input } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { LoginRequest } from "../../types";
import { PrimaryButton } from "../../components/PrimaryButton";
import AccountTypeSwitch from "./AccountTypeSwitch";
import { FormInstance } from "antd/es/form";
import { COMPONENT_SIZES, SPACING } from "../../styles";

interface LoginFormProps {
  form: FormInstance;
  loading: boolean;
  onSubmit: (values: LoginRequest) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ form, loading, onSubmit }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
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
        style={{ marginBottom: SPACING.xxxl }}
      >
        <AccountTypeSwitch form={form} />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <PrimaryButton
          loading={loading}
          height={COMPONENT_SIZES.button.xlarge.height}
          width="100%"
        >
          {loading ? "Signing In..." : "Sign In to Roomies"}
        </PrimaryButton>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
