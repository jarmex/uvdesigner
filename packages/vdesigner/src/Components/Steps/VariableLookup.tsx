import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { VariableContext } from '../../Context';

const StyledDropDown = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: row-reverse;
`;
const DropDownStyled = styled(Dropdown)`
  color: ${({theme}) =>theme.defaultbuttontextcolor};
  /* background-color: ${({theme}) =>theme.defaultbuttonbackcolor}; */
  border-color: ${({theme}) =>theme.defaultbuttonbackcolor};
  font-size: 15px;
`;

interface IVeraibleLookup {
  addLookup: (v: string) => void;
}

const VariableLookup: React.FC<IVeraibleLookup> = ({addLookup}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const variableContext = useContext(VariableContext);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const handleDropDown = (item: string) => {
    addLookup('$' + item);
  }
  const displayVariables = () => {
    if (variableContext.variable) {
      return variableContext.variable.map((item, i) => (
        <DropdownItem key={`${item}-${i}`} onClick={() => handleDropDown(item)}>{item}</DropdownItem>
      ));
    }
    return null;
  }
  return (
    <StyledDropDown>
      <DropDownStyled isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret>Lookup variable</DropdownToggle>
        <DropdownMenu>{displayVariables()}</DropdownMenu>
      </DropDownStyled>
    </StyledDropDown>
  );
}

export default VariableLookup
