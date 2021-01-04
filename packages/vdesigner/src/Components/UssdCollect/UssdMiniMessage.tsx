import React, { useState, useContext } from "react";
import {
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { VariableContext } from "../../Context";

const UssdMiniMessageStyled = styled.div`
  margin-top: 5px;
  margin-bottom: 10px;
`;

const DropdownToggleStyled = styled(DropdownToggle)`
  border-radius: 0px !important;
`;

const InputGroupTextStyl = styled(InputGroupText)`
  cursor: pointer;
  &:hover {
    background-color: #c7c7c7;
  }
`;

export interface IMiniMessageData {
  text: string;
}

interface IUssdMiniMessage {
  onChange: (index: number, data: IMiniMessageData) => void;
  onClose: (index: number) => void;
  index: number;
  data: IMiniMessageData;
}

const UssdMiniMessage: React.FC<IUssdMiniMessage> = ({
  index,
  data,
  onChange,
  onClose,
}) => {
  const variableContext = useContext(VariableContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = React.createRef<HTMLInputElement>();

  const toggleDropDown = () => setDropdownOpen(!dropdownOpen);

  const handleDropDown = (item: string) => {
    const cupos = inputRef.current?.selectionStart;
    let dataToAdd = data.text + "$" + item;
    if (cupos && cupos != null && cupos > 0) {
      dataToAdd =
        data.text.slice(0, cupos) + "$" + item + data.text.slice(cupos);
    }
    onChange(index, { text: dataToAdd });
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

  const handleCloseAction = () => {
    onClose(index);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, { text: e.target.value });
  };

  return (
    <UssdMiniMessageStyled>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <FontAwesomeIcon icon={faPhoneAlt} />
          </InputGroupText>
        </InputGroupAddon>
        <Input
          innerRef={inputRef}
          name="text"
          placeholder="message text here"
          value={data.text}
          onChange={handleTextChange}
        />
        <InputGroupAddon addonType="append">
          <Dropdown
            addonType="append"
            isOpen={dropdownOpen}
            toggle={toggleDropDown}
          >
            <DropdownToggleStyled caret></DropdownToggleStyled>
            <DropdownMenu>{displayVariables()}</DropdownMenu>
          </Dropdown>
          <InputGroupTextStyl onClick={handleCloseAction}>
            <FontAwesomeIcon icon={faTimes} />
          </InputGroupTextStyl>
        </InputGroupAddon>
      </InputGroup>
    </UssdMiniMessageStyled>
  );
};

export default UssdMiniMessage;
