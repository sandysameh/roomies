import React from "react";
import { ButtonProps } from "antd";
import { StyledPrimaryButton } from "./PrimaryButton.styles";

interface PrimaryButtonProps extends ButtonProps {
  width?: string;
  height?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  width,
  height,
  children,
  ...buttonProps
}) => {
  return (
    <StyledPrimaryButton
      htmlType="submit"
      type="primary"
      width={width}
      height={height}
      {...buttonProps}
    >
      {children}
    </StyledPrimaryButton>
  );
};

export default PrimaryButton;
