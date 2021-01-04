import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Row,
  Col,
  Form,
  Input,
  FormGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { ButtonSty } from "../Styled";

const ConditionStyled = styled.div`
  margin: 5px 0px;
`;
const RightDiv = styled.div`
  text-align: right;
`;

type Comparison = {
  operand1: string;
  operand2: string;
  type: string;
};
type Matcher = {
  text: string;
  regex: string;
};

type IConditionResult = {
  name: string;
  operator: string;
  comparison?: Comparison;
  matcher?: Matcher;
  [key: string]: any;
};
interface ICondition {
  onData: (index: number, data: IConditionResult) => void;
  onClose: (index: number) => void;
  data: IConditionResult;
  index: number;
}

const Conditions = ({ index, onData, onClose, data }: ICondition) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [compare, setCompare] = useState(() => {
    const u = {
      ...data,
      name: `C${index + 1}`,
      operand1: "",
      operand2: "",
      compType: "text",
      operator: "equals",
      isoperand1Valid: false,
      isoperand2Valid: false,
      operand1Valid: false,
      operand2Valid: false,
    };
    if (data.comparison) {
      return {
        ...u,
        operand1: data.comparison.operand1,
        isoperand1Valid: data.comparison.operand1 !== "",
        operand1Valid: data.comparison.operand1 !== "",
        isoperand2Valid: data.comparison.operand2 !== "",
        operand2Valid: data.comparison.operand2 !== "",
        operand2: data.comparison.operand2,
        compType: data.comparison.type,
        operator: data.operator,
      };
    }
    if (data.matcher) {
      return {
        ...u,
        operator: data.operator,
        isoperand1Valid: data.matcher.regex !== "",
        operand1Valid: data.matcher.regex !== "",
        isoperand2Valid: data.matcher.text !== "",
        operand2Valid: data.matcher.text !== "",
        operand1: data.matcher.regex,
        operand2: data.matcher.text,
        compType: "text",
      };
    }
    return u;
  });

  useEffect(() => {
    if (compare.operand1Valid === false && compare.operand2Valid === false) {
      return;
    }
    const { name, operator } = compare;
    const rest: any = { name, operator };
    if (compare.operator === "matches") {
      rest.matcher = {
        regex: compare.operand1,
        text: compare.operand2,
      };
    } else {
      rest.comparison = {
        operand1: compare.operand1,
        operand2: compare.operand2,
        type: compare.compType,
      };
    }
    onData(index, rest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare]);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nvalid = `is${e.target.name}Valid`;
    setCompare((u) => ({
      ...u,
      [e.target.name]: e.target.value,
      [nvalid]: e.target.value !== "",
    }));
  };

  const selectCompareType = (t: string) => {
    setCompare((u) => ({ ...u, compType: t }));
  };

  const handleOnClose = () => {
    onClose(index);
  };

  const handleOnBlurChange = (e: React.FocusEvent<HTMLInputElement>) => {
    // update the state here
    const name = `${e.target.name}Valid`;
    setCompare((u) => ({ ...u, [name]: e.target.value !== "" }));
  };
  return (
    <ConditionStyled>
      <Row>
        <Col sm="3">
          <Input
            type="select"
            name="operator"
            value={compare.operator}
            onChange={handleOnChange}
          >
            <option value="equals">equal</option>
            <option value="notequal">not equal</option>
            <option value="greater">greater</option>
            <option value="greaterEqual">greater or equal</option>
            <option value="less">less</option>
            <option value="lessEqual">less or equal</option>
            <option value="matches">regex match</option>
          </Input>
        </Col>
        <Col sm="8">
          <Form inline>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Input
                type="text"
                name="operand1"
                invalid={!compare.isoperand1Valid}
                placeholder={
                  compare.operator === "matches" ? "pattern" : "operand 1"
                }
                value={compare.operand1}
                onChange={handleOnChange}
                onBlur={handleOnBlurChange}
              />
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Input
                type="text"
                name="operand2"
                placeholder={
                  compare.operator === "matches" ? "text" : "operand 2"
                }
                invalid={!compare.isoperand2Valid}
                value={compare.operand2}
                onChange={handleOnChange}
                onBlur={handleOnBlurChange}
              />
            </FormGroup>
            {compare.operator === "matches" ? null : (
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                  <DropdownToggle
                    tag="span"
                    data-toggle="dropdown"
                    aria-expanded={dropdownOpen}
                  >
                    {compare.compType === "numeric" ? "123..." : "ABCD..."}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => selectCompareType("text")}>
                      Compare as text
                    </DropdownItem>
                    <DropdownItem onClick={() => selectCompareType("numeric")}>
                      Compare as numbers
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </FormGroup>
            )}
          </Form>
        </Col>
        <Col sm="1">
          <RightDiv>
            <ButtonSty onClick={handleOnClose}>
              <FontAwesomeIcon icon={faTrashAlt} />{" "}
            </ButtonSty>
          </RightDiv>
        </Col>
      </Row>
    </ConditionStyled>
  );
};

export default React.memo(Conditions);
