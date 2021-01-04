import React, { useContext, useEffect, useState } from "react";
import { Input } from "reactstrap";
import PanelStep, { IStepProps } from "../Steps/PanelStep";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import Conditions from "./Conditions";
import { ButtonSty, H4 } from "../Styled";
import Actions from "./Actions";
import { ItemTypes } from "../../Utils/ItemTypes";
import { IStep, NodeContext } from "../../Data/NodesDataContext";
import { ensureArray } from "../../Utils";

const PlusButton = styled(ButtonSty)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const CombineConditionDiv = styled.div`
  margin: 7px 0px;
`;

export const ControlStep = ({
  step,
  index,
  moduleIndex,
  moduleName,
}: IStepProps) => {
  const [mstep, setModifyStep] = useState<IStep>(() => {
    const u = { ...step };
    if (!u.actions) {
      u.actions = [];
    }
    if (!u.conditions) {
      u.conditions = [];
    }
    return { ...u };
  });

  const { updateStep } = useContext(NodeContext);

  useEffect(() => {
    const { conditions, actions, conditionExpression, ...rest } = mstep;
    if (!conditions) {
      rest.conditions = [];
    } else {
      const notmp = ensureArray(conditions);
      rest.conditions = notmp.filter((c: any) => c.name !== "tmp");
    }
    if (!actions) {
      rest.actions = [];
    } else {
      const notmp = ensureArray<any>(actions);
      rest.actions = notmp.filter((item) => item.name !== "tmp");
    }
    if (conditionExpression) {
      rest.conditionExpression = conditionExpression;
    } else {
      if (rest.conditions.length > 0) {
        rest.conditionExpression = rest.conditions[0].name;
      }
    }
    const isValid = rest.actions.length > 0 || rest.conditions.length > 0;
    if (updateStep && isValid) {
      updateStep(moduleIndex, index, { ...rest, isValid: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mstep]);

  const handleOnConditionsDataChanged = (idx: number, data: any) => {
    setModifyStep((u) => {
      u.conditions[idx] = data;
      return { ...u };
    });
  };

  const handleConditionClosed = (idx: number) => {
    setModifyStep((u) => {
      const tmp = [...u.conditions];
      // delete the condition expression if the number of conditions is less than 2
      if (tmp.length < 2 && u.conditionExpression) {
        delete u.conditionExpression;
      }
      tmp.splice(idx, 1);
      u.conditions = tmp;
      return { ...u };
    });
  };

  // if the otype === true then move upward exist move downwards
  const handleActionOrderChanged = (curIdx: number, otype: boolean) => {
    // if actions does not exist do nothing
    if (!mstep.actions) return;
    // if at the top and moving upload do nothing
    // if at the bottom and moving downwards do nothing
    if (otype === true && curIdx === 0) return;
    if (otype === false && curIdx === mstep.actions.length - 1) return;
    const u = { ...mstep };
    const nextIdx = otype ? curIdx - 1 : curIdx + 1;
    const g = [...u.actions];
    [g[curIdx], g[nextIdx]] = [g[nextIdx], g[curIdx]];
    u.actions = g;
    // swap data around
    setModifyStep(u);
  };

  const handleActionClosed = (idx: number) => {
    const u = { ...mstep };
    const au = [...u.actions];
    au.splice(idx, 1);
    u.actions = au;
    setModifyStep(u);
  };

  const handleActionDataChanged = (idx: number, actionData: any) => {
    setModifyStep((u) => {
      u.actions[idx] = actionData;
      return { ...u };
    });
  };

  const handleAddNewCondition = () => {
    const u = { ...mstep };
    const cu = [...u.conditions, { name: "tmp" }];
    u.conditions = cu;
    // u.conditions.push({ name: `C${u.conditions.length}` });
    if (u.conditions.length > 1 && !u.conditionExpression) {
      u.conditionExpression = "all";
    }
    setModifyStep(u);
  };

  const handleNewAction = () => {
    const u = { ...mstep };
    const au = [...u.actions, { name: "tmp" }];
    u.actions = au;
    setModifyStep(u);
  };

  const getConditions = (): Array<any> => {
    const tmp = ensureArray(mstep.conditions);
    return tmp;
  };

  const handleConditionExpress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModifyStep((u) => ({ ...u, conditionExpression: e.target.value }));
  };

  const getActionsToDisplay = (): Array<any> => {
    return ensureArray(mstep.actions);
  };
  return (
    <PanelStep
      title={step.label}
      index={index}
      itemType={ItemTypes.Control}
      moduleName={moduleName}
    >
      <div>
        <H4>Conditions</H4>
        {getConditions().map((cond, idx) => (
          <Conditions
            key={cond.name}
            index={idx}
            data={cond}
            onData={handleOnConditionsDataChanged}
            onClose={handleConditionClosed}
          />
        ))}

        <PlusButton onClick={handleAddNewCondition}>
          <FontAwesomeIcon icon={faPlus} />
        </PlusButton>
        {getConditions().length >= 2 ? (
          <CombineConditionDiv>
            <Input type="select" onChange={handleConditionExpress}>
              <option value="all">All conditions should stand</option>
              <option value="any">Any condition should stand</option>
            </Input>
          </CombineConditionDiv>
        ) : null}
      </div>

      <div>
        <H4>Actions</H4>
        {getActionsToDisplay().map((act, idx) => (
          <Actions
            key={act.name}
            index={idx}
            data={act}
            onChangeOrder={handleActionOrderChanged}
            onClose={handleActionClosed}
            onData={handleActionDataChanged}
          />
        ))}
        <PlusButton onClick={handleNewAction}>
          <FontAwesomeIcon icon={faPlus} />{" "}
        </PlusButton>
      </div>
    </PanelStep>
  );
};
