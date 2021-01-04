import React, { useContext, useCallback } from "react";
import {
  Col,
  Row,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import RouteDecision from "./RouteDecision";
import styled from "styled-components";
import { ButtonXs } from "../Styled";
import AddMapping, { IAddMappingData } from "./AddMapping";
import { NodeContext } from "../../Data/NodesDataContext";

const MakeRouteDiv = styled.div``;

const RadioDiv = styled.div`
  margin-left: 40px;
  margin-bottom: 10px;
`;

const RadioText = styled.div`
  margin-right: 60px;
`;

const RouteDecisionStyled = styled.div`
  margin: 25px 0px 10px 0px;
`;

const AddMappingStyled = styled.div`
  margin: 7px 0px;
`;

const AddButtonStyled = styled.div`
  margin: 7px 0px;
`;

export interface IDecisionData {
  doRouting: boolean;
  nextType: string;
  routeMappings: IAddMappingData[];
  nextValueExtractor: string;
  next: string;
}
interface IMakeRouteDecision {
  data: IDecisionData;
  onData: (data: IDecisionData) => void;
}
const MakeRouteDecision = ({ data, onData }: IMakeRouteDecision) => {
  const { nodes } = useContext(NodeContext);

  const handleContinueChecked = () => {
    onData({ ...data, doRouting: !data.doRouting });
  };

  const handleDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    onData({ ...data, [e.target.name]: e.target.value });
  };

  const handleAddMapping = () => {
    const u = [...data.routeMappings, { value: "", next: "" }];
    onData({ ...data, routeMappings: u });
  };

  const handleOnAddMappingClosed = useCallback(
    (idx: number) => {
      const u = [...data.routeMappings];
      u.splice(idx, 1);
      onData({ ...data, routeMappings: u });
    },
    [data, onData]
  );

  const handleOnAddMappingData = useCallback(
    (idx: number, name: string, value: string) => {
      const u = data.routeMappings.map((g, ix) => {
        if (ix === idx) {
          return { ...g, [name]: value };
        }
        return g;
      });
      onData({ ...data, routeMappings: u });
    },
    [data, onData]
  );

  const showMappingData = () => {
    if (data.doRouting && data.nextType === "mapped") {
      return (
        <React.Fragment>
          <Col sm="12">
            <AddButtonStyled>
              <ButtonXs onClick={handleAddMapping}>Add Mapping</ButtonXs>
            </AddButtonStyled>
          </Col>
          {data.routeMappings.map((u, idx) => (
            <Col sm="12" key={`make-d-${idx}`}>
              <AddMappingStyled>
                <AddMapping
                  mapping={u}
                  onChange={(name, value) =>
                    handleOnAddMappingData(idx, name, value)
                  }
                  onClose={() => handleOnAddMappingClosed(idx)}
                />
              </AddMappingStyled>
            </Col>
          ))}
        </React.Fragment>
      );
    }
    return null;
  };

  const showContinueToValue = () => {
    if (data.doRouting && data.nextType === "fixed") {
      return (
        <InputGroup size="sm">
          <Input
            name="next"
            type="select"
            value={data.next}
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
      );
    }
    if (data.doRouting && data.nextType === "mapped") {
      return (
        <InputGroup size="sm">
          <Input
            name="nextValueExtractor"
            placeholder="json value extrator (e.g. author[2].name)"
            value={data.nextValueExtractor}
            onChange={handleDataChanged}
          />
        </InputGroup>
      );
    }
    return null;
  };
  return (
    <Row>
      <Col sm="12">
        <RouteDecisionStyled>
          <RouteDecision />
        </RouteDecisionStyled>
      </Col>
      <Col sm="7">
        <Row>
          <Col sm="12">
            <MakeRouteDiv>
              <InputGroup size="sm">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <Input
                      addon
                      type="checkbox"
                      aria-label="Checkbox for following text input"
                      checked={data.doRouting}
                      onChange={handleContinueChecked}
                    />
                    &nbsp; Continue To
                  </InputGroupText>
                </InputGroupAddon>
                <Input disabled style={{ borderRight: "none" }} />
                {data.doRouting && (
                  <InputGroupAddon addonType="append">
                    <InputGroupText>
                      <RadioDiv>
                        <Input
                          type="radio"
                          name="nextType"
                          value="fixed"
                          checked={data.nextType === "fixed"}
                          onChange={handleDataChanged}
                        />
                      </RadioDiv>
                      <RadioText>Fixed</RadioText>
                    </InputGroupText>
                    <InputGroupText>
                      <RadioDiv>
                        <Input
                          type="radio"
                          name="nextType"
                          value="mapped"
                          checked={data.nextType === "mapped"}
                          onChange={handleDataChanged}
                        />
                      </RadioDiv>
                      <RadioText>Mapped</RadioText>
                    </InputGroupText>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </MakeRouteDiv>
          </Col>
          {showMappingData()}
        </Row>
      </Col>

      <Col sm="5">{showContinueToValue()}</Col>
    </Row>
  );
};

export default React.memo(MakeRouteDecision);
