import React, { useContext, useState } from "react";
import styled from "styled-components";
import { NodeContext } from "../../Data/NodesDataContext";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  Spinner,
  Alert,
  UncontrolledAlert,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import useAxios from "../../Utils/AxiosRequest";

const MainBodyHeaderStyled = styled.div`
  padding: 1px 10px 10px 10px;
  display: flex;
  align-items: center;
  flex-direction: row;
  & > button {
    margin-left: 10px;
    margin-right: 10px;
  }
`;
const MainBodyHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownStart, setDropdownStart] = useState(false);

  const { loading, data, error, request } = useAxios({
    method: "post",
    url: "uvd/save",
    options: {
      manual: true,
    },
  });
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const startToggle = () => setDropdownStart((p) => !p);

  const {
    serviceId,
    nodes,
    setNodes,
    addModule,
    uvdProjectHeader,
    setUVDProjectHeader,
    changeActiveTab,
    addAlert,
  } = useContext(NodeContext);

  const getStartModule = () => {
    if (uvdProjectHeader && nodes) {
      const module = nodes.find(
        (h) => h.name === uvdProjectHeader.startNodeName
      );
      if (module) {
        return module.label;
      }
    }
    return "";
  };

  const handleAddModule = () => {
    if (addModule) addModule();
  };

  const handleSaveData = async () => {
    if (!uvdProjectHeader) {
      // this can't happen but just making typescript happy
      return;
    }
    if (!serviceId && addAlert) {
      addAlert({
        color: "danger",
        message: "Unknown Service ID or Short Code. Try again",
        module: "main",
      });
      return;
    }
    if (!nodes && addAlert) {
      addAlert({
        color: "danger",
        message: "The data cannot be saved now. Try again",
        module: "main",
      });
      return;
    }
    const header: any = { ...uvdProjectHeader };
    // get the lastStepId
    const lastStepId = nodes!
      .map((item) => item.steps.length)
      .reduce((acc, prv) => acc + prv, 0);
    const lastNodeId = nodes!.length;
    const dataToSave = nodes?.map((item) => {
      return {
        kind: item.kind,
        label: item.label,
        name: item.name,
        steps: item.steps
          .filter((sp) => sp.isValid === true)
          .map(({ isValid, ...rest }) => ({ ...rest })),
      };
    });
    const project = {
      lastNodeId,
      lastStepId,
      header,
      nodes: dataToSave || [],
    };

    // make a request to save the data
    request({
      data: {
        serviceId,
        message: project,
      },
    });
  };

  const checkData = () => {
    if (data) {
      return data.data.status === 0;
    }
    return false;
  };

  const handleEditAll = () => {
    if (nodes) {
      const newNode = nodes.map((h) => ({ ...h, tabEnabled: true }));
      setNodes && setNodes(newNode);
    }
  };

  const handleHideAll = () => {
    // change all the tabEnabled to false except the startNodeName
    if (nodes && uvdProjectHeader) {
      const newNode = nodes.map((u) => ({
        ...u,
        tabEnabled: u.name === uvdProjectHeader.startNodeName,
      }));
      setNodes && setNodes(newNode);
    }
  };

  const handleOnChangeActiveTab = (tabname: string) => {
    // make the tabEnabled true;
    if (setNodes) {
      setNodes((h) =>
        h.map((i) => {
          if (i.name === tabname) {
            return { ...i, tabEnabled: true };
          }
          return { ...i };
        })
      );
    }
    // change to the active tab
    if (changeActiveTab) {
      changeActiveTab(tabname);
    }
  };
  const handleStartModule = (tabname: string) => {
    if (setUVDProjectHeader) {
      setUVDProjectHeader((h) => ({ ...h, startNodeName: tabname }));
    }
    if (changeActiveTab) {
      changeActiveTab(tabname);
    }
  };
  if (loading) {
    return (
      <MainBodyHeaderStyled>
        <Spinner color="danger" style={{ width: "3rem", height: "3rem" }} />
      </MainBodyHeaderStyled>
    );
  }
  return (
    <MainBodyHeaderStyled>
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret tag="span">
          Modules
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={handleEditAll}>Edit All</DropdownItem>
          <DropdownItem onClick={handleHideAll}>Hide All</DropdownItem>
          <DropdownItem divider />

          {nodes?.map((h) => (
            <DropdownItem
              key={h.name}
              onClick={() => handleOnChangeActiveTab(h.name)}
            >
              {h.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Button color="link" onClick={handleAddModule}>
        <FontAwesomeIcon icon={faPlusCircle} style={{ color: "#434a5b" }} />
      </Button>

      <Dropdown isOpen={dropdownStart} toggle={startToggle}>
        <DropdownToggle caret tag="span">
          Startup module <strong>{getStartModule()}</strong>
        </DropdownToggle>
        <DropdownMenu>
          {nodes?.map((h) => (
            <DropdownItem
              key={h.name}
              onClick={() => handleStartModule(h.name)}
            >
              {h.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Button
        color="link"
        style={{ color: "#1ea5db" }}
        onClick={handleSaveData}
      >
        Save
      </Button>
      {error && <Alert color="danger">{error.message}</Alert>}
      {checkData() && (
        <UncontrolledAlert color="info">Save successfully</UncontrolledAlert>
      )}
    </MainBodyHeaderStyled>
  );
};

export default MainBodyHeader;
