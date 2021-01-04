import React from "react";
import CollapseHeader from "./CollapseHeader";

const RouteDecision = () => {
  return (
    <CollapseHeader title="Make a routing decision" id="routeDecisionId">
      <div>
        <p>
          Check 'Continue to' checkbox below to change call flow after the
          External Service has responded:
        </p>
        <p>Select 'fixed' to use a hardcoded module setting.</p>
        <p>
          Select 'mapped' to create mappings from values returned in your
          response to destination modules. The 'Module Scope' behaviour
          described in 'dynamic' applies here too.
        </p>
        <p>
          Leave 'Continue to' unchecked if you don't want to change the call
          flow at this point.
        </p>
      </div>
    </CollapseHeader>
  );
};

export default React.memo(RouteDecision);
