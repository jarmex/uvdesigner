import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";
import { useDrag } from "react-dnd";
import { DragItem } from "../../Utils/ItemTypes";

const DragButtonsStyled = styled.div`
  margin: 1px;
  color: #ffffff;
  /*background-color: #1ea5db;*/
  background-color: #026465;
  z-index: 1;
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: bold;
  display: block;
  padding: 8px;
  text-align: left;
  opacity: 0.9;
  cursor: move;
  border-radius: 3px;
`;

interface IDragButtons {
  icon: IconProp;
  title: string;
  itemType: string;
}

const DragButtons = ({ icon, title, itemType }: IDragButtons) => {
  const dragitem: DragItem = {
    index: -1,
    id: itemType,
    type: itemType,
    isButton: true,
  };
  const [{ isDragging }, drag] = useDrag({
    item: dragitem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  return (
    <DragButtonsStyled ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <FontAwesomeIcon icon={icon} /> &nbsp; {title}
    </DragButtonsStyled>
  );
};

export default DragButtons;
