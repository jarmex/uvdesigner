import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Row, Col, Popover, PopoverBody } from "reactstrap";
import { H4 } from "../Styled";

type WithChildren<T = {}> = T & { children?: React.ReactNode };

type CardProps = WithChildren<{
  title: string;
  id: string;
}>;

const CollapseHeader = ({ title, children, id }: CardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  return (
    <Row>
      <Col sm="12">
        <H4>
          {title}{" "}
          <FontAwesomeIcon icon={faInfoCircle} onClick={toggle} id={id} />
        </H4>
        <Popover placement="bottom" isOpen={isOpen} target={id} toggle={toggle}>
          <PopoverBody>{children}</PopoverBody>
        </Popover>
      </Col>
    </Row>
  );
};

export default React.memo(CollapseHeader);
