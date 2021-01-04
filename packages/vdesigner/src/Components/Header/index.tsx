import React from "react";
import Logo from "../../Images/uvlogo.png";
import styled from "styled-components";
import { Button } from "reactstrap";
import { useHistory } from "react-router-dom";

const HeaderContainer = styled.header`
  height: 80px;
  padding: 10px 30px;
  & > img {
    height: 50px;
  }
  border-bottom: 5px solid #026465;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BStyled = styled(Button)`
  color: #026465;
  font-weight: bold;
`;

const HeaderComponent = () => {
  const history = useHistory();

  const handleLogout = () => {
    sessionStorage.clear();
    history.push("/");
  };
  return (
    <HeaderContainer>
      <img src={Logo} alt="USSD Visual Designer" />
      <div>
        <BStyled color="link" onClick={handleLogout}>
          Logout
        </BStyled>
      </div>
    </HeaderContainer>
  );
};

export default HeaderComponent;
