import styled from "styled-components";
import { Button, DropdownToggle } from "reactstrap";

export const ButtonSty = styled(Button)`
  color: ${({ theme }) => theme.primarybuttontextcolor};
  background-color: ${({ theme }) => theme.primarybuttonbackcolor};
  border-color: ${({ theme }) => theme.primarybuttonbackcolor};
`;

export const ButtonXs = styled(ButtonSty)`
  font-size: 12px;
`;
export const H4 = styled.h4`
  padding-top: 7px;
  font-size: 18px;
`;

export const RightDiv = styled.div`
  text-align: right;
`;

export const ExternalServiceHttpHeaderSty = styled.div`
  padding-top: 10px;
  padding-bottom: 10px;
`;

export const DropdownToggleSty = styled(DropdownToggle)`
  color: ${({ theme }) => theme.primarybuttontextcolor};
  background-color: ${({ theme }) => theme.primarybuttonbackcolor};
  border-color: ${({ theme }) => theme.primarybuttonbackcolor};
  font-size: 12px;
  font-weight: bold;
`;
