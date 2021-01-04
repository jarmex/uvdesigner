import React from "react";

import {
  faAlignJustify,
  faCogs,
  faEnvelope,
  faExternalLinkAlt,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { ItemTypes } from "../../Utils/ItemTypes";
import DragButtons from "./DragButtons";

const DragButtonMenus = () => {
  return (
    <div>
      <DragButtons
        icon={faEnvelope}
        title="USSD Message"
        itemType={ItemTypes.USSDMessage}
      />
      <DragButtons
        icon={faQuestion}
        title="USSD Collect"
        itemType={ItemTypes.USSDCollect}
      />
      <DragButtons icon={faCogs} title="Control" itemType={ItemTypes.Control} />
      <DragButtons
        icon={faExternalLinkAlt}
        title="External Service"
        itemType={ItemTypes.ExternalService}
      />
      <DragButtons icon={faAlignJustify} title="Log" itemType={ItemTypes.Log} />
    </div>
  );
};

export default DragButtonMenus;
