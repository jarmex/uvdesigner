import React, { useEffect, useContext, useRef } from "react";
import {
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  Container,
  Spinner,
  Alert,
} from "reactstrap";
import styled from "styled-components";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DragButtonMenus from "../../Components/Steps/DragButtonMenus";
import MainDropBody from "./MainDropBody";
import MainBodyHeader from "./MainBodyHeader";
import { INodeItem, NodeContext } from "../../Data/NodesDataContext";
import TabNavItem from "./TabNavItem";
import HeaderComponent from "../../Components/Header";
import useAxios from "../../Utils/AxiosRequest";
import { ensureArray } from "../../Utils";
import { useParams } from "react-router-dom";

const MenuButtons = styled(Col)`
  padding-top: 14px;
`;

const VContainer = styled(Container)`
  background-color: #f1f1f1;
  padding-top: 20px;
`;

//const NavLinkStyled = styled(NavLink).attrs((props) => ({
//  className: props.className,
//}))`
//  &.active {
//  }
//`;

const MainPage = () => {
  const {
    nodes,
    setNodes,
    setUVDProjectHeader,
    changeActiveTab,
    activeTab,
    alerts,
    removeAlert,
    setServiceId,
  } = useContext(NodeContext);
  const { serviceId } = useParams<Record<string, string | undefined>>();
  const { loading, data: response, error } = useAxios(() => {
    // const serviceId = sessionStorage.getItem("serviceId");
    return {
      url: `/uvd/${serviceId}`,
      method: "get",
    };
  });

  const isProcessed = useRef(false);

  useEffect(() => {
    if (setServiceId && serviceId) {
      setServiceId(serviceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const processResponse = () => {
      let startName = "start";
      const mdatat = response?.data.message;
      const status = response?.data.status;
      if (mdatat && status === 0) {
        isProcessed.current = true;
        const { nodes: eNodes, header } = mdatat;
        if (setUVDProjectHeader) {
          const {
            startNodeName = "start",
            projectKind = "ussd",
            version = "1.0",
            owner = "administrator@company.com",
          } = header;
          setUVDProjectHeader({
            startNodeName,
            projectKind,
            version,
            owner,
          });
          startName = startNodeName;
        }
        if (eNodes && Array.isArray(eNodes) && setNodes) {
          setNodes(
            eNodes.map(({ steps, ...item }, idx) => {
              const stepsArray = ensureArray(steps).map((st: any) => ({
                ...st,
                isValid: true,
              }));
              return {
                ...item,
                steps: stepsArray,
                tabEnabled: item.name === startName,
                moduleIndex: idx,
              };
            })
          );
        }
      } else if (status === 1) {
        isProcessed.current = true;
        setUVDProjectHeader &&
          setUVDProjectHeader({
            startNodeName: "start",
            projectKind: "ussd",
            version: "1.0",
            owner: "administrator@company.com",
          });
      }
      changeActiveTab && changeActiveTab(startName);
    };
    if (isProcessed.current === false && response !== null) {
      processResponse();
    }
  }, [response, changeActiveTab, setNodes, setUVDProjectHeader]);

  const toggle = (tab: string) => {
    if (activeTab !== tab) {
      changeActiveTab && changeActiveTab(tab);
    }
  };

  const getActiveTabs = (): INodeItem[] => {
    if (nodes) {
      return nodes.filter((u) => u.tabEnabled === true);
    }
    return [];
  };
  const showTabNav = () => {
    return (
      <Nav tabs>
        {getActiveTabs().map((t) => (
          <NavItem key={t.name}>
            <TabNavItem
              name={t.name}
              title={t.label}
              toggle={() => {
                toggle(t.name);
              }}
            />
          </NavItem>
        ))}
      </Nav>
    );
  };

  const showTabContents = () => {
    return (
      <TabContent activeTab={activeTab}>
        {getActiveTabs().map((t) => (
          <TabPane tabId={t.name} key={t.name}>
            <MainDropBody module={t} />
          </TabPane>
        ))}
      </TabContent>
    );
  };
  const onDismissAlert = (idx: string) => {
    removeAlert!(idx);
  };
  const ShowAlerts = () => {
    if (alerts) {
      return (
        <React.Fragment>
          {alerts.map((art, i) => (
            <Alert
              key={i}
              color={art.color}
              isOpen={true}
              toggle={() => onDismissAlert(art.module)}
            >
              {art.message} (Module: {art.module})
            </Alert>
          ))}
        </React.Fragment>
      );
    }
    return null;
  };

  return (
    <React.Fragment>
      <HeaderComponent />
      {loading ? (
        <Container style={{ textAlign: "center", paddingTop: "50px" }}>
          <Spinner color="danger" style={{ width: "4rem", height: "4rem" }} />
        </Container>
      ) : (
        <VContainer fluid>
          {error && <Alert color="danger">{error.message}</Alert>}
          <ShowAlerts />
          <DndProvider backend={HTML5Backend}>
            <Row>
              <MenuButtons sm="2">
                <DragButtonMenus />
              </MenuButtons>
              <Col sm="10">
                <MainBodyHeader />
                {showTabNav()}
                {showTabContents()}
              </Col>
            </Row>
          </DndProvider>
        </VContainer>
      )}
    </React.Fragment>
  );
};

export default MainPage;
