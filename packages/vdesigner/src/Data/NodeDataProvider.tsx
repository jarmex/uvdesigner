import React, { useMemo, useState } from "react";
import {
  AlertData,
  INodeItem,
  IStep,
  NodeContext,
  UVDProjectHeader,
} from "./NodesDataContext";

type Props = {
  children: React.ReactNode;
};

const startNode: INodeItem = {
  name: "start",
  label: "Welcome",
  kind: "ussd",
  steps: [],
  tabEnabled: true,
  moduleIndex: 0,
};

const NodeDataProvider = ({ children }: Props) => {
  const [nodes, setNodes] = useState<INodeItem[]>([startNode]);
  const [serviceId, setServiceId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("start");
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [uvdProjectHeader, setUVDProjectHeader] = useState<UVDProjectHeader>({
    projectKind: "ussd",
    owner: "self",
    startNodeName: "start",
    version: "1.0",
  });

  const proContext = useMemo(
    () => ({
      changeActiveTab: (tabName: string) => {
        setActiveTab(tabName);
        //TODO if the dropdown is selected make the tab active
      },
      clearModules: () => {
        setNodes([]);
      },
      addModule: () => {
        let newName: string = "";
        setNodes((u) => {
          newName = `module${u.length}`;
          return [
            ...u,
            {
              name: newName,
              label: `Untitled module - ${u.length}`,
              kind: "ussd",
              steps: [],
              tabEnabled: true,
              moduleIndex: u.length,
            },
          ];
        });
        if (newName) {
          setActiveTab(newName);
        }
      },

      renameModule: (name: string, newLabel: string) => {
        const idx = nodes.findIndex((h) => h.name === name);
        if (idx !== -1) {
          setNodes((u) => {
            u[idx].label = newLabel;
            return u;
          });
        }
      },

      addStep: (module: string, index: number, step: IStep) => {
        const idx = nodes.findIndex((h) => h.name === module);
        if (idx !== -1) {
          setNodes((u) => {
            // getstep name
            const curCount = u
              .map((b) => b.steps.length)
              .reduce((acc, cur) => acc + cur, 0);
            const newStep = {
              ...step,
              name: `step${curCount}`,
            };
            const copyStep = [...u[idx].steps];
            if (index < 0) {
              copyStep.push(newStep);
            } else {
              copyStep.splice(index, 0, newStep);
            }
            u[idx].steps = [...copyStep];
            return [...u];
          });
        }
      },

      removeStep: (module: string, index: number) => {
        const idx = nodes.findIndex((h) => h.name === module);
        if (idx !== -1) {
          setNodes((u) => {
            const stps = [...u[idx].steps];
            stps.splice(index, 1);
            u[idx].steps = stps;
            return [...u];
          });
        }
      },

      updateStep: (moduleIndex: number, index: number, data: IStep) => {
        // update the state by searching for the step within the module
        if (moduleIndex >= 0) {
          setNodes((u) => {
            u[moduleIndex].steps[index] = data;
            return [...u];
          });
        }
      },

      save: async () => {
        // make a call to the backend and pass nodes value to be saved
        console.log("Yet to be done");
      },

      moveStep: (moduleName: string, dragIndex: number, hoverIndex: number) => {
        const idx = nodes.findIndex((m) => m.name === moduleName);
        if (idx !== -1) {
          const item = nodes[idx].steps[dragIndex];
          setNodes((p) => {
            const otherSteps = p[idx].steps.filter(
              (_, ind) => ind !== dragIndex
            );
            otherSteps.splice(hoverIndex, 0, item);
            p[idx].steps = [...otherSteps];
            return [...p];
          });
        }
      },

      addAlert: (alert: AlertData) => {
        setAlerts((u) => [...u, alert]);
      },

      removeAlert: (module: string) => {
        setAlerts((u) => {
          return u.filter((p) => p.module !== module);
        });
      },
    }),
    [nodes]
  );

  return (
    <NodeContext.Provider
      value={{
        nodes,
        alerts,
        activeTab,
        ...proContext,
        setNodes,
        uvdProjectHeader,
        setUVDProjectHeader,
        serviceId,
        setServiceId,
      }}
    >
      {children}
    </NodeContext.Provider>
  );
};

export default NodeDataProvider;
