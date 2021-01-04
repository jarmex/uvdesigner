import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Input,
  Row,
  Spinner,
} from "reactstrap";
import useAxios from "../../Utils/AxiosRequest";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import logo from "../../Images/uvlogo.png";

const InputStyled = styled(Input)`
  border: none;
  border-bottom: 2px solid #141d33;
  margin-bottom: 20px;
  padding-bottom: 0;
  border-radius: 0;
  box-shadow: none;
  font-weight: 400;
  height: auto;
  font-size: 16px;

  &:focus {
    outline: none !important;
    outline-width: 0 !important;
    box-shadow: none;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
  }
`;

const LogoImg = styled.img`
  height: 80px;
`;
const LoginContainer = styled.div`
  width: 50%;
  margin: 0 auto;
  padding-top: 20%;
  text-align: center;
`;

const LogoContainer = styled.div`
  padding-bottom: 30px;
  text-align: center;
  & > h1 {
    color: #141d33;
  }
`;

const ButtonStyled = styled(Button)`
  width: 150px;
  margin-top: 10px;
  font-size: 1.2rem;
  background-color: #026465;
  border-color: #026465;
`;
const LoginPage = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });
  const [myError, setMyError] = useState("");

  const { loading, data: logindata, error, request } = useAxios({
    url: "auth",
    method: "post",
    options: {
      manual: true,
    },
  });

  const history = useHistory();

  useEffect(() => {
    if (logindata !== null) {
      if (logindata.data && logindata.data.status === 0) {
        sessionStorage.setItem("login:key", logindata.data.message.id);
        history.push("/shortcodes");
      } else if (logindata.data && logindata.data.status === -1) {
        history.push(`/changepwd/${logindata.data.id}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logindata]);

  const handleDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((t) => ({ ...t, [e.target.name]: e.target.value }));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data.username || !data.password) {
      setMyError("All fields are required.");
      return;
    }
    sessionStorage.clear();
    request({
      data,
    });
  };

  return (
    <Container>
      <LoginContainer>
        <Row>
          <Col sm="12">
            <LogoContainer>
              <LogoImg src={logo} alt="UV Designer" />
            </LogoContainer>
          </Col>
          {myError && (
            <Col sm="12">
              <Alert color="danger">{myError}</Alert>
            </Col>
          )}

          {error !== null && (
            <Col sm="12">
              <Alert color="danger">{error.message}</Alert>
            </Col>
          )}
          {loading === true ? (
            <Spinner color="info" style={{ width: "3rem", height: "3rem" }} />
          ) : (
            <Col sm="12">
              <Form onSubmit={handleLogin}>
                <Row>
                  <Col sm="12">
                    <InputStyled
                      required
                      placeholder="username"
                      name="username"
                      value={data.username}
                      onChange={handleDataChanged}
                    />
                  </Col>
                  <Col sm="12">
                    <InputStyled
                      required
                      type="password"
                      placeholder="password"
                      name="password"
                      value={data.password}
                      onChange={handleDataChanged}
                    />
                  </Col>
                  <Col sm="12">
                    <ButtonStyled disabled={loading} color="info">
                      Login
                    </ButtonStyled>
                  </Col>
                </Row>
              </Form>
            </Col>
          )}
        </Row>
      </LoginContainer>
    </Container>
  );
};

export default LoginPage;
