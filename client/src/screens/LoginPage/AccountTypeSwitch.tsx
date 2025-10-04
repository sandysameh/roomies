import React from "react";
import { Switch, Typography } from "antd";
import { FormInstance } from "antd/es/form";
import { AccountType } from "../../types";
import { FONT_SIZES } from "../../styles";
import { AccountTypeContainer, AccountTypeInfo } from "./LoginPage.styles";

const { Text } = Typography;

interface AccountTypeSwitchProps {
  form: FormInstance;
}

const AccountTypeSwitch: React.FC<AccountTypeSwitchProps> = ({ form }) => {
  const isAdmin = form.getFieldValue("isAdmin");

  return (
    <AccountTypeContainer>
      <AccountTypeInfo>
        <Text strong>Account Type</Text>
        <Text type="secondary" style={{ fontSize: FONT_SIZES.sm }}>
          {isAdmin
            ? "Admin - Can create rooms"
            : "Regular User - Can join rooms"}
        </Text>
      </AccountTypeInfo>
      <Switch
        checkedChildren={AccountType.ADMIN}
        unCheckedChildren={AccountType.USER}
        onChange={(checked) => {
          form.setFieldsValue({ isAdmin: checked });
        }}
      />
    </AccountTypeContainer>
  );
};

export default AccountTypeSwitch;
