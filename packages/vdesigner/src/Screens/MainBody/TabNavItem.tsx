import React, { useState, useContext, useLayoutEffect } from "react";
import { Input, NavLink } from "reactstrap";
import styled from "styled-components";
import { NodeContext } from "../../Data/NodesDataContext";

const BHStyled = styled.div`
  cursor: pointer;
`;

const NavLinkStyled = styled(NavLink).attrs((props) => ({
  className: props.className,
}))`
  border: none !important;
  &.active {
    font-weight: bold;
    color: #ffffff !important;
    background-color: #026465 !important;
  }
`;

interface ITabHeader {
  name: string;
  title: string;
  toggle: (name: string) => void;
}

const TabNavItem = ({ title, name, toggle }: ITabHeader) => {
  const [isClicked, setIsClicked] = useState(false);
  const [editData, setEditData] = useState(title);
  const { activeTab, renameModule } = useContext(NodeContext);

  const inputRef = React.createRef<HTMLInputElement>();
  useLayoutEffect(() => {
    if (isClicked) {
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isClicked, inputRef]);
  const onEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData(e.target.value);
  };

  const handleSaveChanges = () => {
    renameModule && renameModule(name, editData);
    setIsClicked(false);
  };

  const handleToggle = () => {
    if (activeTab === name) {
      setIsClicked(true);
    } else {
      toggle(name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveChanges();
    }
  };
  return (
    <BHStyled>
      {isClicked ? (
        <Input
          innerRef={inputRef}
          value={editData}
          onChange={onEditChange}
          onBlur={handleSaveChanges}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <NavLinkStyled
          className={activeTab === name ? "active" : ""}
          onClick={handleToggle}
        >
          {editData}
        </NavLinkStyled>
      )}
    </BHStyled>
  );
};

export default TabNavItem;
