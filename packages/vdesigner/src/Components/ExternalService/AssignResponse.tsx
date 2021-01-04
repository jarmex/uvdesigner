import React from "react";
import CollapseHeader from "./CollapseHeader";

const AssignResponse = () => {
  return (
    <CollapseHeader title="Assign response to variables" id="assignPopoverId">
      <React.Fragment>
        <p>
          Assign JSON response fields to VDesigner variables to access the data
          returned from VDesigner components. Create an assignment for each
          separate piece of information you need.
        </p>
        <p>For each assignment:</p>
        <ul>
          <li>
            Fill in the 'Assign to' field with the name of the VDesigner
            variable you want to create.
          </li>
          <li>
            Enter the actual JSON path to extract the data. It should always
            start with . (dot)
          </li>
        </ul>
      </React.Fragment>
    </CollapseHeader>
  );
};

export default React.memo(AssignResponse);
