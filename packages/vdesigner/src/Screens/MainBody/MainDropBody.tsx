import React, { useContext } from "react";
import { useDrop } from "react-dnd";
import { DragItem, getItemTitle, ItemTypes } from "../../Utils/ItemTypes";
import styled, { css } from "styled-components";
import { INodeItem, NodeContext } from "../../Data/NodesDataContext";
import LogStep from "../../Components/Log";
import { ControlStep } from "../../Components/Control";
import ExternalServiceStep from "../../Components/ExternalService";
import UssdMessageStep from "../../Components/UssdMessage";
import UssdCollectStep from "../../Components/UssdCollect";

interface StyledProps {
  $isOver: boolean;
}

const DropZoneSty = styled.div`
  min-height: 90vh;
  background-color: #ffffff;
  ${({ $isOver }: StyledProps) =>
    $isOver &&
    css`
      background-color: #1ea5db;
      height: 10px;
      width: 100%;
      opacity: 0.2;
    `};
`;

const MainDropBody = ({ module }: { module: INodeItem }) => {
  const { addStep, nodes } = useContext(NodeContext);
  const { moduleIndex } = module;
  const [{ isOver }, drop] = useDrop({
    accept: [
      ItemTypes.Log,
      ItemTypes.Control,
      ItemTypes.USSDCollect,
      ItemTypes.USSDMessage,
      ItemTypes.ExternalService,
    ],
    drop: (item: DragItem) => {
      //console.log(item);
      if (!item.isButton) return;
      const gettitle = getItemTitle(item.id);
      addStep &&
        addStep(module.name, item.index, {
          name: "",
          label: gettitle,
          kind: item.id,
          title: gettitle,
          isValid: false,
        });
    },

    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const getSteps = nodes?.find((f) => f.name === module.name)?.steps;

  return (
    <DropZoneSty ref={drop} $isOver={isOver}>
      {getSteps &&
        getSteps.map((s, idx) => {
          if (s.kind === ItemTypes.Log) {
            return (
              <LogStep
                key={s.name}
                index={idx}
                moduleName={module.name}
                moduleIndex={moduleIndex}
                step={s}
              />
            );
          }
          if (s.kind === ItemTypes.Control) {
            return (
              <ControlStep
                key={s.name}
                index={idx}
                moduleName={module.name}
                moduleIndex={moduleIndex}
                step={s}
              />
            );
          }
          if (s.kind === ItemTypes.ExternalService) {
            return (
              <ExternalServiceStep
                key={s.name}
                index={idx}
                moduleName={module.name}
                moduleIndex={moduleIndex}
                step={s}
              />
            );
          }
          if (s.kind === ItemTypes.USSDMessage) {
            return (
              <UssdMessageStep
                key={s.name}
                index={idx}
                moduleName={module.name}
                moduleIndex={moduleIndex}
                step={s}
              />
            );
          }
          if (s.kind === "ussdCollect") {
            return (
              <UssdCollectStep
                key={s.name}
                index={idx}
                moduleName={module.name}
                moduleIndex={moduleIndex}
                step={s}
              />
            );
          }
          return null;
        })}
    </DropZoneSty>
  );
};

export default MainDropBody;
