import React, { useContext } from "react";
import styled from "styled-components";
import {
  Row,
  Col,
  InputGroup,
  Input,
  InputGroupText,
  InputGroupAddon,
  FormGroup,
  FormFeedback,
  Form,
  Button,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { NodeContext } from "../../Data/NodesDataContext";

const MenuResponseStyled = styled.div`
  margin-bottom: 7px;
`;

const ButtonStyled = styled(Button)`
  border: 0px !important;
`;
export interface IMenuResponseData {
  digits: string;
  next: string;
}
interface IMenuResponse {
  data: IMenuResponseData;
  onDataChange: (index: number, data: IMenuResponseData) => void;
  onClose: (index: number) => void;
  index: number;
}

const MenuResponse: React.FC<IMenuResponse> = ({
  index,
  data,
  onDataChange,
  onClose,
}) => {
  const { nodes } = useContext(NodeContext);

  const handleOnTextChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof IMenuResponseData;
    onDataChange(index, { ...data, [name]: e.target.value });
  };

  const handleRemoveMenuResponse = () => {
    onClose(index);
  };
  return (
    <MenuResponseStyled>
      <Form>
        <Row>
          <Col sm="5">
            <FormGroup>
              <InputGroup size="sm">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>Reply</InputGroupText>
                </InputGroupAddon>
                <Input
                  type="text"
                  placeholder="123"
                  invalid={data.digits === ""}
                  value={data.digits}
                  name="digits"
                  onChange={handleOnTextChanged}
                />
              </InputGroup>
              <FormFeedback>Invalid reply value</FormFeedback>
            </FormGroup>
          </Col>
          <Col sm="6">
            <InputGroup size="sm">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>Continue To</InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                onChange={handleOnTextChanged}
                name="next"
                value={data.next}
                invalid={data.next === ""}
              >
                <option></option>
                {nodes?.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.label}
                  </option>
                ))}
              </Input>
            </InputGroup>
          </Col>
          <Col sm="1">
            <ButtonStyled outline onClick={handleRemoveMenuResponse}>
              <FontAwesomeIcon icon={faTimes} />
            </ButtonStyled>
          </Col>
        </Row>
      </Form>
    </MenuResponseStyled>
  );
};

export default React.memo(MenuResponse);
