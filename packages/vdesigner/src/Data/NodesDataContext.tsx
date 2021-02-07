import React from "react";

export interface IStep {
  name: string;
  kind: string;
  label: string;
  title: string;
  isValid: boolean;
  [key: string]: any;
}

export interface INodeItem {
  name: string;
  label: string;
  kind: string;
  steps: IStep[];
  tabEnabled: boolean;
  moduleIndex: number;
}

export interface AlertData {
  message: string;
  module: string;
  color: string;
}

export type SessionData = {
  tablist: string[];
};

export interface UVDProjectHeader {
  projectKind: string;
  startNodeName: string;
  version: string;
  owner: string;
}
export interface UVDProject {
  lastStepId: number;
  lastNodeId: number;
  header: UVDProjectHeader;
}

export interface INodeProps {
  serviceId: string;
  nodes: INodeItem[];
  uvdProjectHeader: UVDProjectHeader;
  addModule: () => void;
  renameModule: (name: string, newLabel: string) => void;
  addStep: (module: string, index: number, step: IStep) => void;
  removeStep: (module: string, index: number) => void;
  updateStep: (moduleIndex: number, index: number, data: IStep) => void;
  clearModules: () => void;
  save: () => Promise<void>;
  activeTab: string;
  changeActiveTab: (tabName: string) => void;
  moveStep: (module: string, dragIndex: number, hoverIndex: number) => void;
  alerts: AlertData[]; // list of alert to be displayed
  addAlert: (alert: AlertData) => void;
  removeAlert: (module: string) => void;
  sessionData: SessionData;
  setSessionData: React.Dispatch<React.SetStateAction<SessionData>>;
  setUVDProjectHeader: React.Dispatch<React.SetStateAction<UVDProjectHeader>>;
  setNodes: React.Dispatch<React.SetStateAction<INodeItem[]>>;
  setServiceId: React.Dispatch<React.SetStateAction<string>>;
}

export const NodeContext = React.createContext<Partial<INodeProps>>({});
