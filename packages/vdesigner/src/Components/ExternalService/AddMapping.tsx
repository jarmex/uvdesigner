import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import {
  Row,
  Col,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Button,
} from "reactstrap";
import styled from "styled-components";
import { NodeContext } from "../../Data/NodesDataContext";

const RemoveBorder = styled(Button)`
  border: none !important;
`;

export interface IAddMappingData {
  value: string;
  next: string;
}

type IAddMappingProps = {
  onChange: (name: string, value: string) => void;
  onClose: () => void;
  mapping: IAddMappingData;
};

const AddMapping = ({ onChange, mapping, onClose }: IAddMappingProps) => {
  const { nodes } = useContext(NodeContext);

  const handleDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <Row>
      <Col sm="11">
        <InputGroup size="sm">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Value</InputGroupText>
          </InputGroupAddon>
          <Input
            placeholder="value"
            value={mapping.value}
            name="value"
            onChange={handleDataChanged}
            invalid={mapping.value === ""}
          />
          <InputGroupAddon addonType="prepend" className="input-group-append">
            <InputGroupText>Continue To</InputGroupText>
          </InputGroupAddon>
          <Input
            type="select"
            name="next"
            value={mapping.next}
            onChange={handleDataChanged}
            invalid={mapping.next === ""}
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
      <Col sm="1">
        <RemoveBorder outline onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </RemoveBorder>
      </Col>
    </Row>
  );
};

export default React.memo(AddMapping);
