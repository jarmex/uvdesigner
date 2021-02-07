import React from "react";
import Logo from "../../Images/uvlogo.png";
import styled from "styled-components";
import { Button } from "reactstrap";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

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

const RightAlignItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;
const HeaderComponent = () => {
  const history = useHistory();

  const handleLogout = () => {
    sessionStorage.clear();
    history.push("/");
  };
  const handleSettings = () => {
    history.push("/settings/mtn");
  };
  return (
    <HeaderContainer>
      <img src={Logo} alt="USSD Visual Designer" />
      <RightAlignItems>
        <div>
          <FontAwesomeIcon
            icon={faCog}
            size="lg"
            style={{ color: "#026465" }}
            onClick={handleSettings}
          />
        </div>
        <BStyled color="link" onClick={handleLogout}>
          Logout
        </BStyled>
      </RightAlignItems>
    </HeaderContainer>
  );
};

export default HeaderComponent;
