import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import {
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import styled from "styled-components";

const RowStyled = styled(Row)`
  padding-top: 7px;
  padding-bottom: 7px;
`;

export interface IAssignData {
  destVariable: string;
  scope: string;
  valueExtractor: string;
  moduleNameScope: string;
}
interface IAddAssignment {
  onData: (index: number, data: IAssignData) => void;
  onClose: (index: number) => void;
  index: number;
  data: IAssignData;
}

const AddAssignment = ({ onData, onClose, index, data }: IAddAssignment) => {
  // handle when the close button is click
  const handleCloseAction = () => {
    onClose(index);
  };

  const handleDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    onData(index, { ...data, [e.target.name]: e.target.value });
  };

  return (
    <RowStyled>
      <Col sm="7">
        <Row>
          <Col sm="12">
            <InputGroup size="sm">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>Assign to</InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="type variable name"
                name="destVariable"
                value={data.destVariable}
                onChange={handleDataChanged}
              />
              <div className="input-group-prepend input-group-append">
                <div className="input-group-text">Scope</div>
              </div>
              <Input
                type="select"
                name="scope"
                value={data.scope}
                onChange={handleDataChanged}
              >
                <option value="module">module</option>
                <option value="application">application</option>
              </Input>
            </InputGroup>
          </Col>
          <Col sm="12" style={{ display: "none" }}>
            <InputGroup size="sm">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>Module scope</InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                value={data.moduleNameScope}
                name="moduleNameScope"
                onChange={handleDataChanged}
              >
                <option value="all">--All--</option>
              </Input>
            </InputGroup>
          </Col>
        </Row>
      </Col>
      <Col sm="5">
        <InputGroup size="sm">
          <Input
            placeholder="json value extrator e.g. store.book[1].title"
            name="valueExtractor"
            value={data.valueExtractor}
            onChange={handleDataChanged}
          />
          <InputGroupAddon addonType="append">
            <InputGroupText>
              <FontAwesomeIcon icon={faTimes} onClick={handleCloseAction} />
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Col>
    </RowStyled>
  );
};

export default React.memo(AddAssignment);
