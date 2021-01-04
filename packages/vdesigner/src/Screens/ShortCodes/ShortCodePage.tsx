import React, { useState } from "react";
import useAxios from "../../Utils/AxiosRequest";
import styled from "styled-components";
import { Alert, Button, Col, Container, Row, Spinner, Table } from "reactstrap";
import { useHistory } from "react-router-dom";
import CreateShortCode from "./CreateShortCode";
import HeaderComponent from "../../Components/Header";

const ShortCodeRow = styled.tr`
  &:hover {
    cursor: pointer;
  }
`;
const ShortCodePage = () => {
  const [modal, setModal] = useState(false);
  const [gettingUvd, setGettingUvd] = useState<{
    error: Error | null;
    isLoading: boolean;
  }>({
    error: null,
    isLoading: false,
  });

  const { loading, data, error, request: refetch } = useAxios({
    method: "get",
    url: "uvd/shortcodes",
  });

  const history = useHistory();

  const toggle = () => setModal(!modal);

  const getData = () => {
    if (data) {
      if (data.data.status === 0) {
        return data.data.message as Array<any>;
      }
    }
    return [];
  };

  const handleShortCodeSelected = async (serviceId: string) => {
    // make a request to the the current uvd using the serviceId
    try {
      sessionStorage.setItem("serviceId", serviceId);
      history.push(`/main/${serviceId}`);
    } catch (error) {
      setGettingUvd({
        isLoading: false,
        error: error,
      });
    }
  };

  const toggleRefresh = () => {
    refetch();
    toggle();
  };
  if (loading) {
    return (
      <Container>
        <Spinner
          color="info"
          style={{ width: "3rem", height: "3rem" }}
        ></Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert color="danger">{error.message}</Alert>
      </Container>
    );
  }

  return (
    <React.Fragment>
      <HeaderComponent />
      <Container fluid>
        {gettingUvd.isLoading && (
          <Row>
            <Col sm="12">
              <Spinner color="secondary" />
            </Col>
          </Row>
        )}
        {gettingUvd.error && (
          <Row>
            <Col sm="12">
              <Alert color="danger">{gettingUvd.error.message}</Alert>
            </Col>
          </Row>
        )}
        {getData().length === 0 ? (
          <Row>
            <Col sm="12">
              <div
                style={{
                  textAlign: "center",
                  paddingTop: "20px",
                  paddingBottom: "20px",
                }}
              >
                No short codes are defined. Use the "Add Short Code" button to
                create a new short code.{" "}
              </div>
            </Col>
          </Row>
        ) : (
          <Table striped hover>
            <thead>
              <tr>
                <th>Short Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {getData().map((item) => (
                <ShortCodeRow
                  key={item.serviceId}
                  onClick={() => handleShortCodeSelected(item.serviceId)}
                >
                  <td>{item.mapKey}</td>
                  <td>{item.description}</td>
                </ShortCodeRow>
              ))}
            </tbody>
          </Table>
        )}
        <div style={{ textAlign: "right" }}>
          <Button color="dark" onClick={toggle}>
            Add Short Code
          </Button>
        </div>
        <CreateShortCode
          isOpen={modal}
          toggle={toggle}
          toggleRefresh={toggleRefresh}
        />
      </Container>
    </React.Fragment>
  );
};

export default ShortCodePage;
