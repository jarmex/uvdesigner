import React, { useState, useRef, useContext } from "react";
import styled from "styled-components";
import PanelHeading from "./PanelHeading";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { ItemTypes, DragItem } from "../../Utils/ItemTypes";
import { IStep, NodeContext } from "../../Data/NodesDataContext";

const PanelStepStyled = styled.div`
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid transparent;
  border-color: ${({ theme }) => theme.bordercolor};
  background-color: ${({ theme }) => theme.stepbackgroundcolor};
  border-radius: 3px;
`;

interface IPanelStep {
  title: string;
  itemType: string;
  index: number;
  moduleName: string;
}

const PanelBody = styled.div`
  padding: 10px 15px 2px 15px;
  color: ${({ theme }) => theme.steptextcolor};
`;

export interface IStepProps {
  index: number;
  moduleName: string;
  moduleIndex: number;
  step: IStep;
}
const PanelStep: React.FC<IPanelStep> = ({
  title,
  children,
  index,
  itemType,
  moduleName,
}) => {
  const [isActive, setIsActive] = useState(true);
  const toggle = (hide: boolean) => setIsActive(hide);
  const ref = useRef<HTMLDivElement>(null);
  const { moveStep } = useContext(NodeContext);
  const [, drop] = useDrop({
    accept: [
      ItemTypes.Log,
      ItemTypes.Control,
      ItemTypes.USSDCollect,
      ItemTypes.USSDMessage,
      ItemTypes.ExternalService,
    ],
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoveredRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoveredRect.bottom - hoveredRect.top) / 2;
      const mousePosition = monitor.getClientOffset()!;
      const hoverClientY = mousePosition.y - hoveredRect.top;

      // for now return nothing when it is a button;
      if (item.isButton) {
        // add and move
        item.index = hoverIndex;
        return;
      }

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveStep && moveStep(moduleName, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: itemType, id: itemType, index, isButton: false },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // display the panel body if isActive === true
  const showPanelBody = () => {
    if (isActive) {
      return <PanelBody>{children}</PanelBody>;
    }
    return null;
  };

  drag(drop(ref));

  return (
    <PanelStepStyled ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <PanelHeading
        title={title}
        toggle={toggle}
        id={itemType}
        index={index}
        moduleName={moduleName}
      />
      {showPanelBody()}
    </PanelStepStyled>
  );
};

export default PanelStep;
