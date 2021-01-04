import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { InputGroup, Input, InputGroupAddon, InputGroupText } from "reactstrap";

const CogDiv = styled.div`
  margin: 7px 0px 20px 0px;
  &:first-child {
    padding-bottom: 10px;
  }
`;
const TextAreaDiv = styled.div`
  margin: 5px 0px;
`;

export interface IHttpHeaderConfig {
  method: string;
  contentType: string;
  username?: string;
  password?: string;
  requestBody?: string;
}
type HttpHeaderConfigProps = {
  data: IHttpHeaderConfig;
  onUpdate: (data: IHttpHeaderConfig) => void;
};
const HttpHeaderConfig = ({ data, onUpdate }: HttpHeaderConfigProps) => {
  const [enableHeaderConfig, setEnableHeaderConfig] = useState(false);

  const handleHttpHeaderConfig = () => {
    setEnableHeaderConfig(!enableHeaderConfig);
  };

  const handleOnChangedData = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <CogDiv>
      <FontAwesomeIcon icon={faCog} onClick={handleHttpHeaderConfig} />
      <br />
      {enableHeaderConfig && (
        <React.Fragment>
          <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Method</InputGroupText>
            </InputGroupAddon>
            <Input
              type="select"
              value={data.method}
              onChange={handleOnChangedData}
              name="method"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </Input>
            <InputGroupAddon addonType="prepend" className="input-group-append">
              <InputGroupText>Content Type</InputGroupText>
            </InputGroupAddon>
            <Input
              type="select"
              name="contentType"
              value={data.contentType}
              onChange={handleOnChangedData}
            >
              <option
                value="application/x-www-form-urlencoded"
                title="Send request data using application/x-www-form-urlencoded content type"
              >
                www form
              </option>
              <option
                value="application/json"
                title="Send request data using application/json content type"
              >
                json
              </option>
            </Input>
            <InputGroupAddon addonType="prepend" className="input-group-append">
              <InputGroupText>Username</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder="username"
              name="username"
              value={data.username}
              onChange={handleOnChangedData}
            />
            <InputGroupAddon addonType="prepend" className="input-group-append">
              <InputGroupText>Password</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder="password"
              name="password"
              value={data.password}
              onChange={handleOnChangedData}
            />
          </InputGroup>
          <TextAreaDiv>
            <Input
              type="textarea"
              placeholder="type POST/PUT content here"
              name="requestBody"
              value={data.requestBody}
              onChange={handleOnChangedData}
            />
          </TextAreaDiv>
        </React.Fragment>
      )}
    </CogDiv>
  );
};

export default React.memo(HttpHeaderConfig);
