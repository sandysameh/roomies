import React from "react";
import { Modal, Form, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ModalForm, ModalActions, CancelButton } from "./Dashboard.styles";
import { SPACING } from "../../styles";

interface CreateRoomModalProps {
  visible: boolean;
  loading: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: (values: { name: string }) => void;
  width?: string;
  height?: string;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  visible,
  loading,
  form,
  onCancel,
  onSubmit,
  width,
  height,
}) => {
  return (
    <Modal
      title="Create New Room"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={width}
      style={{ height }}
    >
      <ModalForm>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
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

          <Form.Item style={{ marginBottom: 0, marginTop: SPACING.xxl }}>
            <ModalActions>
              <CancelButton onClick={onCancel}>Cancel</CancelButton>
              <PrimaryButton loading={loading} icon={<PlusOutlined />}>
                Create Room
              </PrimaryButton>
            </ModalActions>
          </Form.Item>
        </Form>
      </ModalForm>
    </Modal>
  );
};

export default CreateRoomModal;
