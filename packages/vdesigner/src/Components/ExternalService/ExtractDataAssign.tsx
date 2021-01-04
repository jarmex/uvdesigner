import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import { ButtonXs, RightDiv } from "../Styled";

const ExtractDataAssign = () => {
  const [data, setData] = useState({
    propertyNamed: "",
    objectType: "string:object",
    itemAtPosition: "",
    value: "",
    objectAccess: "",
    arrayIndex: "",
  });

  const handleDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...data, [e.target.name]: e.target.value };
    setData(newData);
  };

  const showObjectSelected = () => {
    if (data.objectType === "string:object") {
      return (
        <React.Fragment>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText></InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                name="propertyNamed"
                value={data.propertyNamed}
                onChange={handleDataChanged}
              >
                <option value="?"></option>
                <option label="propertyNamed" value="string:propertyNamed">
                  propertyNamed
                </option>
              </Input>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText></InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="type the object property to access"
                name="objectAccess"
                value={data.objectAccess}
                onChange={handleDataChanged}
              />
            </InputGroup>
          </FormGroup>
        </React.Fragment>
      );
    }
    return null;
  };

  const showArraySelected = () => {
    if (data.objectType === "string:array") {
      return (
        <React.Fragment>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText></InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                name="itemAtPosition"
                value={data.itemAtPosition}
                onChange={handleDataChanged}
              >
                <option value="?"></option>
                <option label="itemAtPosition" value="string:itemAtPosition">
                  itemAtPosition
                </option>
              </Input>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText></InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="type array item index"
                type="number"
                name="arrayIndex"
                value={data.arrayIndex}
                onChange={handleDataChanged}
              />
            </InputGroup>
          </FormGroup>
        </React.Fragment>
      );
    }
    return null;
  };

  const showValueSelected = () => {
    if (data.objectType === "string:value") {
      return (
        <FormGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText></InputGroupText>
            </InputGroupAddon>
            <Input
              name="value"
              value={data.value}
              onChange={handleDataChanged}
            />
          </InputGroup>
        </FormGroup>
      );
    }
    return null;
  };
  return (
    <Row>
      <Col sm="12">
        <Form inline>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>&nbsp;</InputGroupText>
            </InputGroupAddon>
            <Input
              type="select"
              name="objectType"
              value={data.objectType}
              onChange={handleDataChanged}
            >
              <option label="object" value="string:object">
                object
              </option>
              <option label="array" value="string:array">
                array
              </option>
              <option label="value" value="string:value">
                value
              </option>
            </Input>
          </InputGroup>
          {showObjectSelected()}
          {showArraySelected()}
          {showValueSelected()}
        </Form>
      </Col>
      <Col sm="12">
        <RightDiv>
          <ButtonXs>
            <FontAwesomeIcon icon={faUndo} />{" "}
          </ButtonXs>
          <ButtonXs>Add Operation</ButtonXs>
        </RightDiv>
      </Col>
    </Row>
  );
};

export default React.memo(ExtractDataAssign);
