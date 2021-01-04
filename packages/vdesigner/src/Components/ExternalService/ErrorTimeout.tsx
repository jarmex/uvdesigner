import React, { ChangeEvent, useContext } from "react";
import styled from "styled-components";
import {
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import { H4 } from "../Styled";
import { NodeContext } from "../../Data/NodesDataContext";

export interface IErrorTimoutResult {
  exceptionNext: string;
  timeout: string;
  onTimeout: string;
}

interface IErrorTimeout {
  data: IErrorTimoutResult;
  onData: (data: IErrorTimoutResult) => void;
}

const ErrorTimeoutDiv = styled.div`
  margin-top: 30px;
  margin-bottom: 10px;
`;

const ErrorTimeout = ({ data, onData }: IErrorTimeout) => {
  const { nodes } = useContext(NodeContext);

  const handleDataChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const newData: IErrorTimoutResult = {
      ...data,
      [e.target.name]: e.target.value,
    };
    onData(newData);
  };
  return (
    <ErrorTimeoutDiv>
      <H4>Errors & Timeouts</H4>
      <Row>
        <Col sm="5">
          <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>On Remote Error</InputGroupText>
            </InputGroupAddon>
            <Input
              type="select"
              value={data.exceptionNext}
              name="exceptionNext"
              onChange={handleDataChanged}
            >
              <option />
              {nodes?.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.label}
                </option>
              ))}
            </Input>
          </InputGroup>
        </Col>
        <Col sm="7">
          <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Timeout</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder="5000"
              value={data.timeout}
              name="timeout"
              onChange={handleDataChanged}
            />
            <InputGroupAddon addonType="prepend" className="input-group-append">
              <InputGroupText>On Timeout</InputGroupText>
            </InputGroupAddon>

            <Input
              type="select"
              value={data.onTimeout}
              name="onTimeout"
              onChange={handleDataChanged}
            >
              <option />
              {nodes?.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.label}
                </option>
              ))}
            </Input>
          </InputGroup>
        </Col>
      </Row>
    </ErrorTimeoutDiv>
  );
};

export default React.memo(ErrorTimeout);
