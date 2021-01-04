import React, { useState, useEffect, useContext } from "react";
import PanelStep, { IStepProps } from "../Steps/PanelStep";
import { Form, FormGroup, Label, Input } from "reactstrap";
import VariableLookup from "../Steps/VariableLookup";
import { ItemTypes } from "../../Utils/ItemTypes";
import { NodeContext } from "../../Data/NodesDataContext";

const LogStep = ({ step, index, moduleName, moduleIndex }: IStepProps) => {
  const [logdata, setLogdata] = useState({
    message: step.message,
    isMsgValid: step.message !== "",
  });
  const textareaRef = React.createRef<HTMLTextAreaElement>();

  const { updateStep } = useContext(NodeContext);

  useEffect(() => {
    if (logdata.isMsgValid) {
      updateStep &&
        updateStep(moduleIndex, index, {
          ...step,
          message: logdata.message,
          isValid: true,
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logdata]);

  const addVariable = (variable: string) => {
    if (textareaRef.current != null) {
      const cupos = textareaRef.current.selectionStart;
      setLogdata((u) => {
        const msg =
          u.message.slice(0, cupos) + variable + u.message.slice(cupos);
        return { ...u, message: msg };
      });
    } else {
      setLogdata((u) => ({ ...u, message: `${logdata}${variable}` }));
    }
  };

  const handleOnChange = (e: string) => {
    setLogdata((u) => ({ ...u, message: e }));
  };

  const handleOnBlurChange = (e: React.FocusEvent<HTMLInputElement>) => {
    setLogdata((u) => ({ ...u, isMsgValid: e.target.value !== "" }));
  };
  return (
    <PanelStep
      title={step.label}
      index={index}
      itemType={ItemTypes.Log}
      moduleName={moduleName}
    >
      <Form>
        <FormGroup>
          <Label for={`logid-${index}`}>Log</Label>
          <Input
            type="textarea"
            name="text"
            id={`logid-${index}`}
            value={logdata.message}
            innerRef={textareaRef}
            onBlur={handleOnBlurChange}
            onChange={(e) => handleOnChange(e.target.value)}
          />
          <VariableLookup addLookup={addVariable} />
        </FormGroup>
      </Form>
    </PanelStep>
  );
};

export default LogStep;
