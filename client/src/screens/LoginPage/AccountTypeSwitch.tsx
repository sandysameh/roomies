import React from "react";
import { Switch } from "antd";
import { FormInstance } from "antd/es/form";
import { AccountType } from "../../types";
import {
  AccountTypeContainer,
  AccountTypeInfo,
  AccountTypeLabel,
  AccountTypeDescription,
} from "./LoginPage.styles";

interface AccountTypeSwitchProps {
  form: FormInstance;
}

const AccountTypeSwitch: React.FC<AccountTypeSwitchProps> = ({ form }) => {
  const isAdmin = form.getFieldValue("isAdmin");

  return (
    <AccountTypeContainer>
      <AccountTypeInfo>
        <AccountTypeLabel>Account Type</AccountTypeLabel>
        <AccountTypeDescription type="secondary">
          {isAdmin
            ? "Admin - Can create rooms"
            : "Regular User - Can join rooms"}
        </AccountTypeDescription>
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
