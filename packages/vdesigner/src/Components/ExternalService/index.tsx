import React, { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import {
  Input,
  InputGroup,
  Row,
  Col,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import PanelStep, { IStepProps } from "../Steps/PanelStep";
import { ButtonXs, ExternalServiceHttpHeaderSty, H4 } from "../Styled";
import KeyValuePair, { IKeyValuePair } from "../Steps/KeyValuePair";
import AssignResponse from "./AssignResponse";
import ErrorTimeout, { IErrorTimoutResult } from "./ErrorTimeout";
import MakeRouteDecision, { IDecisionData } from "./MakeRouteDecision";
import HttpHeaderConfig, { IHttpHeaderConfig } from "./HttpHeaderConfig";
import AddAssignment, { IAssignData } from "./AddAssignment";
import { ItemTypes } from "../../Utils/ItemTypes";
import { ensureArray } from "../../Utils";
import { initialStepData } from "./UtilMethods";
import { IStep, NodeContext } from "../../Data/NodesDataContext";
import { IAddMappingData } from "./AddMapping";

const BGroup = styled.div`
  margin: 7px 0px;
`;

const ExternalService = ({
  step,
  moduleIndex,
  index,
  moduleName,
}: IStepProps) => {
  const [data, setData] = useState<IStep>(() => initialStepData(step));

  const { updateStep } = useContext(NodeContext);

  useEffect(() => {
    if (data.url !== "" && updateStep) {
      updateStep(moduleIndex, index, { ...data, isValid: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const saveData = () => {};
  const handleUrlParamClose = useCallback(
    (idx: number) => {
      const u = [...data.urlParams];
      u.splice(idx, 1);
      setData((g) => ({ ...g, urlParams: u }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, setData]
  );

  const handleUrlData = useCallback(
    (idx: number, kv: IKeyValuePair) => {
      const u = [...data.urlParams].map((it, ix) => {
        if (ix === idx) {
          return kv;
        }
        return it;
      });
      setData((g) => ({ ...g, urlParams: u }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, setData]
  );

  const handleAddUrlData = () => {
    const u = [...data.urlParams, { name: "", value: "" }];
    setData((g) => ({ ...g, urlParams: u }));
  };

  const addHttpHeaderParams = () => {
    const u = [...data.httpHeaders, { name: "", value: "" }];
    setData((g) => ({ ...g, httpHeaders: u }));
  };

  const handleHttpParamClose = useCallback(
    (idx: number) => {
      const u = [...data.httpHeaders];
      u.splice(idx, 1);
      setData((g) => ({ ...g, httpHeaders: u }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, setData]
  );

  // handle when http header param data changes
  const handleHttpParamOnDataChange = useCallback(
    (idx: number, kv: IKeyValuePair) => {
      const u = [...data.httpHeaders].map((it, ix) => {
        if (ix === idx) {
          return kv;
        }
        return it;
      });
      setData((g) => ({ ...g, httpHeaders: u }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, setData]
  );

  const handleOnAddAssignment = () => {
    const u = [
      ...data.assignments,
      {
        valueExtractor: "",
        scope: "application",
        destVariable: "",
        moduleNameScope: "all",
      },
    ];
    setData((g) => ({ ...g, assignments: u }));
  };

  const handleOnRemoveAssignment = useCallback(
    (idx: number) => {
      const u = [...data.assignments];
      u.splice(idx, 1);
      setData((g) => ({ ...g, assignments: u }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, setData]
  );

  // callback to handle data change for assign data
  const handleAssignOnDataChanged = useCallback(
    (idx: number, ia: IAssignData) => {
      const u = [...data.assignments].map((a, ix) => {
        if (ix === idx) {
          return ia;
        }
        return a;
      });
      setData((g) => ({ ...g, assignments: u }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, setData]
  );

  // handle when there is a callback from the error time components
  const handleErrorTimeoutData = useCallback(
    (ie: IErrorTimoutResult) => {
      setData((g) => ({
        ...g,
        exceptionNext: ie.exceptionNext,
        timeout: ie.timeout,
        onTimeout: ie.onTimeout,
      }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setData]
  );

  const handleRouteDecision = useCallback(
    (id: IDecisionData) => {
      setData((g) => ({
        ...g,
        next: id.next,
        nextType: id.nextType,
        doRouting: id.doRouting,
        routeMappings: id.routeMappings,
        nextValueExtractor: id.nextValueExtractor,
      }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setData]
  );

  // extract all the assignments data
  const updateHttpHeaderConfig = useCallback(
    (hdata: IHttpHeaderConfig) => {
      setData((g) => ({
        ...g,
        username: hdata.username,
        method: hdata.method,
        password: hdata.password,
        contentType: hdata.contentType,
        requestBody: hdata.requestBody,
      }));
      saveData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setData]
  );

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((g) => ({ ...g, url: e.target.value }));
  };

  const httpHeaders = ensureArray<IKeyValuePair>(data.httpHeaders);

  const urlParams = ensureArray<IKeyValuePair>(data.urlParams);

  const headerConfig: IHttpHeaderConfig = {
    username: data.username,
    password: data.password,
    method: data.method,
    contentType: data.contentType,
    requestBody: data.requestBody,
  };

  const assignData = ensureArray<IAssignData>(data.assignments);

  const decision: IDecisionData = {
    next: data.next,
    nextValueExtractor: data.nextValueExtractor,
    nextType: data.nextType,
    doRouting: data.doRouting,
    routeMappings: ensureArray<IAddMappingData>(data.routeMappings),
  };

  const errorResult: IErrorTimoutResult = {
    onTimeout: data.onTimeout,
    timeout: data.timeout,
    exceptionNext: data.exceptionNext,
  };

  const handleOnBlurChange = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value !== "") {
      saveData();
    }
  };
  const addServiceParameterForm = () => {
    if (httpHeaders.length > 0) {
      return (
        <Col sm="12">
          <ExternalServiceHttpHeaderSty>
            <H4>Http Headers</H4>
            <Row>
              {httpHeaders.map((u, idx) => (
                <Col sm="6" key={`http-param-${idx}`}>
                  <KeyValuePair
                    onClose={handleHttpParamClose}
                    onData={handleHttpParamOnDataChange}
                    index={idx}
                    data={u}
                  />
                </Col>
              ))}
            </Row>
          </ExternalServiceHttpHeaderSty>
        </Col>
      );
    }
    return null;
  };

  const addUrlDataParameters = () => {
    if (urlParams.length > 0) {
      return (
        <Col sm="12">
          <H4>Url parameters</H4>
          <Row>
            {urlParams.map((sparam, idx) => (
              <Col sm="6" key={`key-url-${idx}`}>
                <KeyValuePair
                  onClose={handleUrlParamClose}
                  onData={handleUrlData}
                  index={idx}
                  data={sparam}
                />
              </Col>
            ))}
          </Row>
        </Col>
      );
    }
    return null;
  };

  return (
    <PanelStep
      title={step.label}
      itemType={ItemTypes.ExternalService}
      index={index}
      moduleName={moduleName}
    >
      <Row>
        <Col sm="12">
          <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Service Url</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder="http://..."
              type="url"
              value={data.url}
              onChange={handleUrlChange}
              onBlur={handleOnBlurChange}
            />
          </InputGroup>
        </Col>
        <Col sm="12">
          <BGroup>
            <ButtonXs size="sm" onClick={addHttpHeaderParams}>
              Add service parameter
            </ButtonXs>{" "}
            <ButtonXs size="sm" onClick={handleAddUrlData}>
              Add http header
            </ButtonXs>
          </BGroup>
        </Col>
        {addServiceParameterForm()}
        {addUrlDataParameters()}
        <Col sm="12">
          <HttpHeaderConfig
            data={headerConfig}
            onUpdate={updateHttpHeaderConfig}
          />
        </Col>
        <Col sm="12">
          <AssignResponse />
        </Col>
        <Col sm="12">
          <ButtonXs onClick={handleOnAddAssignment}>Add assignment</ButtonXs>
        </Col>
        <Col sm="12">
          {assignData.map((a, idx) => (
            <AddAssignment
              onData={handleAssignOnDataChanged}
              onClose={handleOnRemoveAssignment}
              index={idx}
              data={a}
              key={`assignment-in-${idx}`}
            />
          ))}
        </Col>
        <Col sm="12">
          <MakeRouteDecision data={decision} onData={handleRouteDecision} />
        </Col>
        <Col sm="12">
          <ErrorTimeout data={errorResult} onData={handleErrorTimeoutData} />
        </Col>
      </Row>
    </PanelStep>
  );
};

export default ExternalService;
