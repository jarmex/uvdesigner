import React, { useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import useAxios from "../../Utils/AxiosRequest";
import styled from "styled-components";
import { useHistory, useParams } from "react-router-dom";
import logo from "../../Images/uvlogo.png";

const FormStyled = styled(Form)`
  text-align: left;
`;

const InputStyled = styled(Input)`
  border: none;
  border-bottom: 2px solid #141d33;
  padding-bottom: 0;
  padding-left: 0;
  border-radius: 0;
  box-shadow: none;
  font-weight: 300;
  height: auto;
  font-size: 18px;

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
  padding-top: 10%;
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

const Title = styled.h3`
  padding-bottom: 35px;
  padding-top: 50px;
`;
const Register = () => {
  const [data, setData] = useState({
    username: "",
    confirmpassword: "",
    password: "",
    usernameValid: false,
    passwordValid: false,
  });
  const [myError, setMyError] = useState("");

  const { loading, data: logindata, error, request } = useAxios({
    url: "auth/register",
    method: "post",
    options: {
      manual: true,
    },
  });
  const { id } = useParams<Record<string, string | undefined>>();

  const history = useHistory();

  const handleBackToLogin = () => {
    history.push("/");
  };
  const handleDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = `${e.target.name}Valid`;
    let isValid = false;
    if (e.target.name === "password" && e.target.value.length > 7) {
      const hasUpperCase = /[A-Z]/.test(e.target.value);
      const hasLowerCase = /[a-z]/.test(e.target.value);
      const hasNumber = /\d/.test(e.target.value);
      const hasNonAlpha = /\W/.test(e.target.value);
      isValid = hasNonAlpha && hasLowerCase && hasNumber && hasUpperCase;
    }
    if (e.target.name === "username") {
      isValid = e.target.value.length > 7;
    }
    setData((t) => ({
      ...t,
      [e.target.name]: e.target.value,
      [name]: isValid,
    }));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data.confirmpassword !== data.password) {
      setMyError("The passwords do not match");
      return;
    }
    sessionStorage.clear();
    request({
      data: {
        id,
        username: data.username,
        password: data.password,
        createdBy: id,
      },
    });
  };

  const acntSuccess =
    logindata !== null && logindata.data && logindata.data.status === 0;

  if (acntSuccess) {
    return (
      <Container>
        <LoginContainer>
          <Row>
            <Col sm="12"> Account {data.username} created successfully. </Col>
            <Col sm="12">
              <ButtonStyled onClick={handleBackToLogin}>
                Login page
              </ButtonStyled>
            </Col>
          </Row>
        </LoginContainer>
      </Container>
    );
  }
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
              <Title>Enter the new password for administrator </Title>
              <FormStyled onSubmit={handleLogin}>
                <Row>
                  <Col sm="12">
                    <FormGroup>
                      <Label for="username" />
                      <InputStyled
                        id="username"
                        required
                        type="text"
                        placeholder="Enter username"
                        name="username"
                        value={data.username}
                        onChange={handleDataChanged}
                        invalid={!data.usernameValid}
                      />
                      <FormFeedback>
                        The username should contain at least 8 characters
                      </FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col sm="12">
                    <FormGroup>
                      <Label for="password" />
                      <InputStyled
                        required
                        type="password"
                        placeholder="password"
                        name="password"
                        value={data.password}
                        onChange={handleDataChanged}
                        invalid={!data.passwordValid}
                      />
                      <FormFeedback>
                        Password complexity is not matched
                      </FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col sm="12">
                    <FormGroup>
                      <Label for="confirmpassword" />
                      <InputStyled
                        id="confirmpassword"
                        required
                        type="password"
                        placeholder="confirm password"
                        name="confirmpassword"
                        value={data.confirmpassword}
                        onChange={handleDataChanged}
                        invalid={
                          data.password === "" ||
                          data.confirmpassword !== data.password
                        }
                      />
                      <FormFeedback>Does not match the password</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col sm="12">
                    <ButtonStyled disabled={loading} color="info">
                      Login
                    </ButtonStyled>
                  </Col>
                </Row>
              </FormStyled>
            </Col>
          )}
        </Row>
      </LoginContainer>
    </Container>
  );
};

export default Register;
