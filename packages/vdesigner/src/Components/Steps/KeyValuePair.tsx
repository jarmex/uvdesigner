import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useContext, ChangeEvent } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  DropdownItem,
  DropdownMenu,
  InputGroupButtonDropdown,
  Button,
  DropdownToggle,
} from "reactstrap";
import { VariableContext } from "../../Context";
import styled from "styled-components";

const DropdownToggleSty = styled(DropdownToggle)`
  color: ${({ theme }) => theme.primarybuttontextcolor};
  background-color: ${({ theme }) => theme.primarybuttonbackcolor};
  border-color: ${({ theme }) => theme.primarybuttonbackcolor};
  border-radius: 0 !important;
  padding: 2px;
`;

const CloseButton = styled(Button)`
  background-color: #f1f1f1;
  border-color: ${({ theme }) => theme.primarybuttonbackcolor};
`;

const KeyValuePairStyled = styled.div`
  margin: 2px 0px;
`;

export interface IKeyValuePair {
  name: string;
  value: string;
}
type IKeyValuePairProps = {
  data: IKeyValuePair;
  onData: (key: number, data: IKeyValuePair) => void;
  onClose: (idx: number) => void;
  index: number;
};

const KeyValuePair = ({ data, onData, onClose, index }: IKeyValuePairProps) => {
  const [dropdownOpen, setOpen] = useState(false);

  const variableContext = useContext(VariableContext);

  const toggle = () => setOpen(!dropdownOpen);

  const inputRef = React.createRef<HTMLInputElement | HTMLTextAreaElement>();

  const handleCloseKeyValuePair = () => {
    onClose(index);
  };
  const handleDropDown = (item: string) => {
    let newValue = "$" + item;
    if (inputRef && inputRef.current != null) {
      const cupos = inputRef.current.selectionStart || 0;
      newValue =
        data.value.slice(0, cupos) + newValue + data.value.slice(cupos);
    } else {
      newValue = `${data.value}${newValue}`;
    }
    onData(index, { ...data, value: newValue });
  };

  const handleDataChanged = (e: ChangeEvent<HTMLInputElement>) => {
    onData(index, { ...data, [e.target.name]: e.target.value });
  };

  const displayVariables = () => {
    if (variableContext.variable) {
      return variableContext.variable.map((item, i) => (
        <DropdownItem key={`${item}-${i}`} onClick={() => handleDropDown(item)}>
          {item}
        </DropdownItem>
      ));
    }
    return null;
  };
  return (
    <KeyValuePairStyled>
      <InputGroup size="sm">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>Name</InputGroupText>
        </InputGroupAddon>
        <Input
          type="text"
          name="name"
          value={data.name}
          onChange={handleDataChanged}
        />
        <InputGroupAddon addonType="prepend" className="input-group-append">
          <InputGroupText>Value</InputGroupText>
        </InputGroupAddon>
        <Input
          type="text"
          name="value"
          innerRef={inputRef}
          value={data.value}
          onChange={handleDataChanged}
        />

        <InputGroupButtonDropdown
          addonType="append"
          isOpen={dropdownOpen}
          toggle={toggle}
        >
          <DropdownToggleSty split />
          <DropdownMenu>{displayVariables()}</DropdownMenu>
          <CloseButton outline onClick={handleCloseKeyValuePair}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </InputGroupButtonDropdown>
      </InputGroup>
    </KeyValuePairStyled>
  );
};

export default KeyValuePair;
