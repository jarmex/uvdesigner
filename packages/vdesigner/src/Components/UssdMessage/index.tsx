import React, { useState, useEffect, useContext } from "react";
import PanelStep, { IStepProps } from "../Steps/PanelStep";
import { Form, FormGroup, Label, Input } from "reactstrap";
import VariableLookup from "../Steps/VariableLookup";
import styled from "styled-components";
import { ItemTypes } from "../../Utils/ItemTypes";
import { NodeContext } from "../../Data/NodesDataContext";

const CharLeftSpan = styled.span`
  background-color: #d1d1d1;
  display: inline;
  padding: 0.2em 0.6em 0.3em;
  font-size: 75%;
  font-weight: normal;
  line-height: 1;
  color: #727272;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
`;

const CharLeftSpanRed = styled(CharLeftSpan)`
  color: #d9534f;
`;

const UssdMessageStep = ({
  index,
  moduleName,
  moduleIndex,
  step,
}: IStepProps) => {
  const [ussdMessage, setUssdMessage] = useState({
    text: step.text || "",
    isTextValid: step.text !== "",
  });
  const [charLeft, setCharLeft] = useState(0);
  const { updateStep } = useContext(NodeContext);
  const textareaRef = React.createRef<HTMLTextAreaElement>();
  useEffect(() => {
    setCharLeft(182 - ussdMessage.text.length);
    if (ussdMessage.isTextValid) {
      updateStep &&
        updateStep(moduleIndex, index, {
          ...step,
          text: ussdMessage.text,
          isValid: true,
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ussdMessage]);

  const addVariable = (variable: string) => {
    if (textareaRef.current != null) {
      const cupos = textareaRef.current.selectionStart;
      setUssdMessage((u) => {
        return {
          ...u,
          text: u.text.slice(0, cupos) + variable + u.text.slice(cupos),
        };
      });
    } else {
      setUssdMessage((u) => ({ ...u, text: `${ussdMessage}${variable}` }));
    }
  };
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUssdMessage((u) => ({ ...u, text: e.target.value }));
  };

  const handleOnBlurChange = (f: React.FocusEvent<HTMLInputElement>) => {
    if (f.target.value !== "") {
      setUssdMessage({ isTextValid: true, text: f.target.value });
    }
  };

  const displayMessageCount = () => {
    if (charLeft < 0) {
      return (
        <CharLeftSpanRed>{`${Math.abs(
          charLeft
        )} characters will be truncated`}</CharLeftSpanRed>
      );
    }
    return <CharLeftSpan>{`${charLeft} characters left`}</CharLeftSpan>;
  };

  return (
    <PanelStep
      title={step.label}
      itemType={ItemTypes.USSDMessage}
      index={index}
      moduleName={moduleName}
    >
      <Form>
        <FormGroup>
          <Label for={`ussdSayLbl-${moduleName}-${index}`}>
            Text {displayMessageCount()}{" "}
          </Label>
          <Input
            type="textarea"
            name="text"
            id={`ussdSayLbl-${moduleName}-${index}`}
            value={ussdMessage.text}
            innerRef={textareaRef}
            onChange={handleOnChange}
            onBlur={handleOnBlurChange}
            rows={3}
          />
          <VariableLookup addLookup={addVariable} />
        </FormGroup>
      </Form>
    </PanelStep>
  );
};

export default UssdMessageStep;
