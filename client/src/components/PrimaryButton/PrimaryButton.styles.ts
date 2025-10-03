import styled from "styled-components";
import { Button } from "antd";
import { COLORS, COMPONENT_SIZES } from "../../styles";

export const StyledPrimaryButton = styled(Button)<{
  width?: string;
  height?: string;
}>`
  &.ant-btn {
    border: none;
    width: ${(props) => props.width || "auto"};
    height: ${(props) => props.height || COMPONENT_SIZES.button.medium.height};

    &[disabled] {
      background: ${COLORS.background.disabled};
      color: ${COLORS.text.disabled};

      &:hover,
      &:focus,
      &:active {
        background: ${COLORS.background.disabled};
        box-shadow: none;
      }
    }
  }
`;
