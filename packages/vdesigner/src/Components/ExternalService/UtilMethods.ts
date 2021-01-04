import { IStep } from "../../Data/NodesDataContext";
import { ensureArray } from "../../Utils";
import { IKeyValuePair } from "../Steps/KeyValuePair";
import { IAssignData } from "./AddAssignment";
import { IAddMappingData } from "./AddMapping";
import { IErrorTimoutResult } from "./ErrorTimeout";
import { IHttpHeaderConfig } from "./HttpHeaderConfig";

export const initialStepData = (step: IStep): IStep => {
  const u = { ...step };
  u.url = step.url || "";
  u.method = step.method || "GET";
  u.contentType = step.contentType || "application/json";
  u.username = step.username || "";
  u.password = step.password || "";
  u.requestBody = step.requestBody || "";
  u.urlParams = ensureArray<IKeyValuePair>(step.urlParams);
  u.httpHeaders = ensureArray<IKeyValuePair>(step.httpHeaders);
  u.assignments = ensureArray<IAssignData>(step.assignments);
  u.doRouting = step.doRouting || false;
  u.nextType = step.nextType || "fixed";
  u.next = step.next || "";
  u.nextType = step.nextType || "fixed";
  u.routeMappings = ensureArray<IAddMappingData>(step.routeMappings);
  u.nextValueExtractor = step.nextValueExtractor || "";
  u.exceptionNext = step.exceptionNext || "";
  u.onTimeout = step.onTimeout || "";
  u.timeout = step.timeout || "5000";
  return u;
};

export const UpdateFromHeaderConfig = (
  data: IHttpHeaderConfig,
  mstep: IStep
): IStep => {
  const u = { ...mstep };
  Object.keys(data).forEach((item) => {
    const m = data[item as keyof IHttpHeaderConfig];
    if (m !== undefined) {
      u[item] = m;
    }
  });
  return u;
};

export const handleOnErrorUpdate = (
  mstep: IStep,
  eData: IErrorTimoutResult
): IStep => {
  const u = { ...mstep };
  for (const item in eData) {
    u[item] = eData[item as keyof IErrorTimoutResult];
  }
  return u;
};
export const getErrorData = (mstep: IStep): IErrorTimoutResult => {
  return {
    exceptionNext: mstep.exceptionNext,
    timeout: mstep.timeout || "5000",
    onTimeout: mstep.onTimeout || "",
  };
};
