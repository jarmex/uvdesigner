export const ItemTypes = {
  ExternalService: "externalService",
  Log: "log",
  Control: "control",
  USSDMessage: "ussdSay",
  USSDCollect: "ussdCollect",
};

export interface DragItem {
  index: number;
  id: string;
  type: string;
  isButton: boolean;
}

export const getItemTitle = (item: string) => {
  switch (item) {
    case "log":
      return "Log";
    case "externalService":
      return "External Service";
    case "control":
      return "Control";
    case "ussdCollect":
      return "USSD Collect";
    case "ussdSay":
      return "USSD Message";
    default:
      return "";
  }
};
