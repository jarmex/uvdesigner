import React from "react";
import { Col, Input, Row } from "reactstrap";

const ValueExtrator = () => {
  return (
    <div>
      <Row>
        <Col sm="12">
          <Input placeholder="Enter json value extrator" />
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(ValueExtrator);
