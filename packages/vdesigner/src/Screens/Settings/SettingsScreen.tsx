import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  FormGroup,
  Input,
  Form,
  Row,
  Col,
  FormFeedback,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button,
  Spinner,
  Alert,
} from "reactstrap";
import useAxios from "../../Utils/AxiosRequest";

const FormStyled = styled(Form)`
  text-align: left;
`;
const SettingContainer = styled.div`
  width: 80%;
  margin: 0 auto;
  padding-top: 50px;
`;

const SettingsScreen = () => {
  const [data, setState] = useState({
    spPassword: "",
    timeStamp: "",
    endpoint: "",
    //services: [],
    timeout: "30",
    baseUrl: "https://196.201.33.108:18310/",
    spId: "",
    serviceId: "",
    activationNumber: "",
  });

  const [msg, setMsg] = useState({
    color: "success",
    message: "",
  });

  const runOnce = React.useRef(false);

  const {
    request: refetch,
    loading,
    data: settingsData,
    error: settingError,
  } = useAxios({
    method: "post",
    url: "settings",
    data: {
      connector: "MTN",
    },
  });

  const {
    loading: postLoading,
    error: postError,
    request: sendData,
    data: postData,
  } = useAxios({
    method: "post",
    url: "settings/mtn",
    options: {
      manual: true,
    },
  });

  useEffect(() => {
    if (postError != null) {
      setMsg({
        color: "danger",
        message: postError.message,
      });
      return;
    }
    if (settingError) {
      setMsg({
        color: "danger",
        message: settingError.message,
      });
      return;
    }
    if (postData && runOnce.current) {
      refetch();
      setMsg({
        color: "success",
        message: "Setting successfully changed",
      });
      runOnce.current = false;
    }
  }, [postData, postError, refetch, setMsg, settingError]);

  useEffect(() => {
    if (!settingsData) return;
    if (!settingsData.data) return;
    const { services, ...rest } = settingsData.data;
    const temp: any = {};
    if (services && Array.isArray(services)) {
      temp.spId = services[0].spId;
      temp.activationNumber = services[0].activationNumber;
      temp.serviceId = services[0].serviceId;
    }
    if (rest) {
      setState((prv) => ({
        ...prv,
        ...temp,
        spPassword: rest.spPassword || prv.spPassword,
        endpoint: rest.endpoint || prv.endpoint,
        timeout: rest.timeout || prv.timeout,
        baseUrl: rest.baseUrl || prv.baseUrl,
        timeStamp: rest.timeStamp || prv.timeStamp,
      }));
    }
  }, [settingsData]);

  const handleDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prv) => ({ ...prv, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      sendData({
        data: {
          spPassword: data.spPassword,
          services: [
            {
              spId: data.spId,
              serviceId: data.serviceId,
              activationNumber: data.activationNumber,
            },
          ],
          endpoint: data.endpoint,
          baseUrl: data.baseUrl,
          timeStamp: data.timeStamp,
          timeout: parseInt(data.timeout || "30"),
        },
      });
      runOnce.current = true;
    } catch (err) {
      runOnce.current = false;
    }
  };

  if (loading || postLoading) {
    return (
      <SettingContainer>
        <Spinner
          color="info"
          style={{ width: "3rem", height: "3rem" }}
        ></Spinner>
      </SettingContainer>
    );
  }

  return (
    <SettingContainer>
      {msg.message && <Alert color={msg.color}>{msg.message}</Alert>}
      <FormStyled onSubmit={handleFormSubmit}>
        <Row>
          <Col sm="12">
            <FormGroup>
              <Input
                required
                type="text"
                placeholder="spPassword"
                name="spPassword"
                value={data.spPassword}
                onChange={handleDataChanged}
              />
            </FormGroup>
          </Col>
          <Col sm="12">
            <FormGroup>
              <Input
                required
                type="text"
                placeholder="timeStamp"
                name="timeStamp"
                value={data.timeStamp}
                onChange={handleDataChanged}
              />
            </FormGroup>
          </Col>
          <Col sm="12">
            <FormGroup>
              <Input
                required
                type="text"
                placeholder="endpoint"
                name="endpoint"
                value={data.endpoint}
                onChange={handleDataChanged}
              />
            </FormGroup>
          </Col>
          <Col sm="12">
            <FormGroup>
              <Input
                required
                type="text"
                placeholder="baseUrl"
                name="baseUrl"
                value={data.baseUrl}
                onChange={handleDataChanged}
              />
              <FormFeedback>
                The base url including the port number
              </FormFeedback>
            </FormGroup>
          </Col>
          <Col sm="12">
            <FormGroup>
              <Input
                required
                type="text"
                placeholder="timeout"
                name="timeout"
                value={data.timeout}
                onChange={handleDataChanged}
              />
            </FormGroup>
          </Col>
          <Col sm="12">
            <FormGroup>
              <InputGroup size="sm">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>spId</InputGroupText>
                </InputGroupAddon>
                <Input
                  type="text"
                  placeholder="Enter spId number e.g. 2330110000230"
                  value={data.spId}
                  onChange={handleDataChanged}
                  name="spId"
                />
                <InputGroupAddon
                  addonType="prepend"
                  className="input-group-append"
                >
                  <InputGroupText>ServiceId</InputGroupText>
                </InputGroupAddon>
                <Input
                  type="text"
                  placeholder="Enter Service Id number. e.g. 233012000003967"
                  value={data.serviceId}
                  onChange={handleDataChanged}
                  name="serviceId"
                />
                <InputGroupAddon
                  addonType="prepend"
                  className="input-group-append"
                >
                  <InputGroupText>Activation Number</InputGroupText>
                </InputGroupAddon>
                <Input
                  type="text"
                  placeholder="Enter Activation Number e.g. *5912*9314#"
                  name="activationNumber"
                  value={data.activationNumber}
                  onChange={handleDataChanged}
                />
              </InputGroup>
            </FormGroup>
          </Col>
          <Col sm="12">
            <Button color="info">Save Changes </Button>
          </Col>
        </Row>
      </FormStyled>
    </SettingContainer>
  );
};

export default SettingsScreen;
