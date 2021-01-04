import React, { useState, useContext } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretRight,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { NodeContext } from "../../Data/NodesDataContext";

const PanelHeadingStyled = styled.div`
  color: ${(props) => props.theme.stepheadingtextcolor};
  background-color: ${(props) => props.theme.stepheadingbackcolor};
  padding: 5px 10px;
  border-bottom: 1px solid transparent;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
`;

const Title = styled.h4`
  margin-top: 0;
  margin-bottom: 0;
  font-size: 16px;
  color: inherit;
`;

const TitleHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const TrashIcon = styled(FontAwesomeIcon)`
  margin-top: 3px;
  cursor: pointer;
`;

const CaretArrow = styled(FontAwesomeIcon)`
  margin-right: 5px;
`;

interface IPanelHeading {
  title: string;
  toggle: (hide: boolean) => void;
  id: string;
  moduleName: string;
  index: number;
}
const PanelHeading: React.FC<IPanelHeading> = ({
  title,
  children,
  toggle,
  id,
  moduleName,
  index,
}) => {
  const [hide, setHide] = useState(false);
  const { removeStep } = useContext(NodeContext);
  const handleHideAction = () => {
    setHide(!hide);
    toggle(hide);
  };

  const handleDeleteAction = () => {
    removeStep && removeStep(moduleName, index);
  };
  return (
    <PanelHeadingStyled>
      <TitleHeader>
        <Title>
          <CaretArrow
            icon={hide ? faCaretRight : faCaretDown}
            onClick={handleHideAction}
          />
          {title}
        </Title>
        <TrashIcon icon={faTrashAlt} onClick={handleDeleteAction} />
      </TitleHeader>
      {children}
    </PanelHeadingStyled>
  );
};

export default PanelHeading;
