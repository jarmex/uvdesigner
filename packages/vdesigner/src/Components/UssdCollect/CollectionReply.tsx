import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import styled from "styled-components";
import { NodeContext } from "../../Data/NodesDataContext";

const ColRight = styled(Col)`
  padding-right: 0 !important;
`;

const ColLeft = styled(Col)`
  padding-left: 0 !important;
`;

const InputGroupRight = styled(Input)`
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
`;

const InputGroupLeft = styled(InputGroupText)`
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-left: 0 !important;
`;

interface ICollectReply {
  onUpdate: (scope: string, continueTo: string, variable: string) => void;
  data: ICollectReplyData;
}

export interface ICollectReplyData {
  next: string;
  collectVariable: string;
  scope: string;
}

const CollectionReply = ({ data, onUpdate }: ICollectReply) => {
  const [assignReply, setAssignReply] = useState({
    ...data,
    nValid: false,
    cValid: false,
    sValid: false,
    scope: data.scope || "application",
  });

  useEffect(() => {
    if (assignReply.nValid && assignReply.cValid && assignReply.sValid) {
      onUpdate(
        assignReply.scope,
        assignReply.next,
        assignReply.collectVariable
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignReply]);

  const { nodes } = useContext(NodeContext);

  const handleVariable = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssignReply((u) => ({
      ...u,
      collectVariable: e.target.value,
      isInvalid: e.target.value.length === 0,
    }));
  };

  const onScopeSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vName = e.target.name === "scope" ? "sValid" : "nValid";
    setAssignReply((u) => {
      return { ...u, [vName]: true, [e.target.name]: e.target.value };
    });
  };

  const handleOnBlurChange = (e: React.FocusEvent<HTMLInputElement>) => {
    setAssignReply((u) => ({ ...u, cValid: e.target.value !== "" }));
  };
  return (
    <Row>
      <Col sm="6">
        <Row>
          <ColRight>
            <InputGroup size="sm">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>Assign reply to</InputGroupText>
              </InputGroupAddon>
              <InputGroupRight
                placeholder="type the variable name"
                value={assignReply.collectVariable}
                onChange={handleVariable}
                onBlur={handleOnBlurChange}
                name="collectVariable"
              />
            </InputGroup>
          </ColRight>
          <ColLeft>
            <InputGroup size="sm">
              <InputGroupAddon addonType="prepend">
                <InputGroupLeft>Scope</InputGroupLeft>
              </InputGroupAddon>
              <Input
                type="select"
                value={assignReply.scope}
                name="scope"
                onChange={onScopeSelected}
              >
                <option>module</option>
                <option>application</option>
              </Input>
            </InputGroup>
          </ColLeft>
        </Row>
      </Col>
      <Col sm="6">
        <InputGroup size="sm">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Continue To</InputGroupText>
          </InputGroupAddon>
          <Input
            type="select"
            name="next"
            value={assignReply.next}
            onChange={onScopeSelected}
          >
            {nodes?.map((s) => (
              <option key={s.name} value={s.name}>
                {s.label}
              </option>
            ))}
          </Input>
        </InputGroup>
      </Col>
    </Row>
  );
};

export default React.memo(CollectionReply);
