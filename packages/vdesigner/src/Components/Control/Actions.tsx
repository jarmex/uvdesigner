import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import {
  Col,
  Row,
  Input,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  DropdownToggle,
  DropdownMenu,
  InputGroupButtonDropdown,
  DropdownItem,
  Form,
  InputGroupText,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faChevronDown,
  faChevronUp,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { ButtonSty, RightDiv } from "../Styled";
import { NodeContext } from "../../Data/NodesDataContext";

export enum ActionTypeEnum {
  Assign = 1,
  Capture,
  ContinueTo,
}

interface IAction {
  onData: (index: number, data: any) => void;
  onClose: (index: number) => void;
  onChangeOrder: (index: number, orderState: boolean) => void;
  index: number;
  data: any;
}

const ActionStyled = styled.div`
  margin: 7px 0px;
`;

const ReOrderStyled = styled.span`
  margin-right: 5px;
`;

const Actions: React.FC<IAction> = ({
  onData,
  onClose,
  onChangeOrder,
  index,
  data,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [act, setAct] = useState<any>(() => {
    const u = {
      ...data,
      expression: "",
      varName: "",
      varScope: "app",
      target: "",
      regex: "",
      data: "",
      name: `A${index + 1}`,
      isvarNameValid: false,
      isexpressionValid: false,
      isdataValid: false,
      isregexValid: false,
      action: "continueTo",
      expressionSubmit: false,
      varNameSubmit: false,
      regexSubmit: false,
      dataSubmit: false,
      istargetValid: false,
    };

    if (data.assign) {
      return {
        ...u,
        action: "assign",
        expression: data.assign.expression,
        varName: data.assign.varName,
        varScope: data.assign.varScope,
        isvarNameValid: data.assign.varName !== "",
        isexpressionValid: data.assign.expression !== "",
        expressionSubmit: true,
        varNameSubmit: true,
      };
    }
    if (data.continueTo) {
      return {
        ...u,
        target: data.continueTo.target,
        istargetValid: data.continueTo.target !== "",
        action: "continueTo",
      };
    }
    if (data.capture) {
      return {
        ...u,
        regex: data.capture.regex,
        isregexValid: data.capture.regex !== "",
        regexSubmit: true,
        data: data.capture.data,
        isdataValid: data.capture.data !== "",
        dataSubmit: true,
        varName: data.capture.varName,
        isvarNameValid: data.capture.varName !== "",
        varNameSubmit: true,
        varScope: data.capture.varScope,
        isCaptureValid: true,
        action: "capture",
      };
    }
    return u;
  });

  // Update parent on data changed
  useEffect(
    () => {
      // update parent
      if (act.action === "continueTo") {
        if (act.target !== "") {
          onData(index, {
            name: act.name,
            continueTo: {
              target: act.target,
            },
          });
        }
      }
      if (act.action === "assign") {
        // validate the entries for assign
        if (act.expressionSubmit && act.varNameSubmit) {
          onData(index, {
            name: act.name,
            assign: {
              expression: act.expression,
              varName: act.varName,
              varScope: act.varScope,
            },
          });
        }
      }
      if (act.action === "capture") {
        if (act.varNameSubmit && act.regexSubmit && act.dataSubmit) {
          onData(index, {
            name: act.name,
            capture: {
              regex: act.regex,
              varScope: act.varScope,
              varName: act.varName,
              data: act.data,
            },
          });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [act]
  );
  const toggleDropDown = () => setDropdownOpen(!dropdownOpen);

  const { nodes } = useContext(NodeContext);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isValidName = `is${e.target.name}Valid`;
    setAct((u: any) => ({
      ...u,
      [e.target.name]: e.target.value,
      [isValidName]: e.target.value !== "",
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "target") {
      setAct((u: any) => ({
        ...u,
        istargetValid: e.target.value !== "",
        [e.target.name]: e.target.value,
      }));
    } else {
      setAct((u: any) => ({ ...u, [e.target.name]: e.target.value }));
    }
  };

  const handleOnBlurChange = (e: React.FocusEvent<HTMLInputElement>) => {
    let name = `${e.target.name}Submit`;
    let isItemValid = e.target.value !== "";
    setAct((u: any) => ({ ...u, [name]: isItemValid }));
  };
  const handleOnClose = () => {
    onClose(index);
  };

  const handleOrderChanged = (orderType: boolean) => {
    onChangeOrder(index, orderType);
  };

  const handleScopeSelected = (scope: string) => {
    setAct((u: any) => ({ ...u, varScope: scope }));
  };

  const displaySelectionAction = () => {
    if (act.action === "continueTo") {
      return (
        <Col sm="7">
          <Input
            type="select"
            name="target"
            value={act.target}
            onChange={handleSelectChange}
            invalid={!act.istargetValid}
          >
            <option></option>
            {nodes?.map((s) => (
              <option key={s.name} value={s.name}>
                {s.label}
              </option>
            ))}
          </Input>
        </Col>
      );
    }

    return (
      <Col sm="8">
        <Row>
          <Col sm="5">
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faArrowRight} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                invalid={!act.isvarNameValid}
                placeholder="variable"
                value={act.varName}
                name="varName"
                onChange={handleOnChange}
                onBlur={handleOnBlurChange}
              />
              <InputGroupButtonDropdown
                addonType="append"
                isOpen={dropdownOpen}
                toggle={toggleDropDown}
              >
                <InputGroupText>
                  <DropdownToggle
                    tag="span"
                    data-toggle="dropdown"
                    aria-expanded={dropdownOpen}
                  >
                    {act.varScope}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleScopeSelected("app")}>
                      application
                    </DropdownItem>
                    <DropdownItem onClick={() => handleScopeSelected("mod")}>
                      module
                    </DropdownItem>
                  </DropdownMenu>
                </InputGroupText>
              </InputGroupButtonDropdown>
            </InputGroup>
          </Col>
          {act.action === "capture" ? (
            <Col sm="7">
              <Form inline>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                  <Input
                    type="text"
                    name="regex"
                    invalid={!act.isregexValid}
                    placeholder="pattern"
                    value={act.regex}
                    onChange={handleOnChange}
                    onBlur={handleOnBlurChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="text"
                    name="data"
                    placeholder="text"
                    invalid={!act.isdataValid}
                    value={act.data}
                    onChange={handleOnChange}
                    onBlur={handleOnBlurChange}
                  />
                </FormGroup>
              </Form>
            </Col>
          ) : (
            <Col sm="7">
              <Input
                type="text"
                name="expression"
                invalid={!act.isexpressionValid}
                value={act.expression}
                onChange={handleOnChange}
                onBlur={handleOnBlurChange}
              />
            </Col>
          )}
        </Row>
      </Col>
    );
  };

  return (
    <ActionStyled>
      <Row>
        <Col sm="2">
          <Input
            type="select"
            name="action"
            value={act.action}
            onChange={handleSelectChange}
          >
            <option value="continueTo">Continue to</option>
            <option value="assign">Assign</option>
            <option value="capture">Capture</option>
          </Input>
        </Col>
        {displaySelectionAction()}
        <Col sm="2">
          <RightDiv>
            <ReOrderStyled>
              <FontAwesomeIcon
                icon={faChevronUp}
                onClick={() => handleOrderChanged(true)}
              />
              <FontAwesomeIcon
                icon={faChevronDown}
                onClick={() => handleOrderChanged(false)}
              />
            </ReOrderStyled>
            <ButtonSty onClick={handleOnClose}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </ButtonSty>
          </RightDiv>
        </Col>
      </Row>
    </ActionStyled>
  );
};

export default React.memo(Actions);
