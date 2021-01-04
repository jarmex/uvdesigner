import React from 'react';

type VariableContextProp = {
  variable: string[];
};
export const variablesValues = [
  "core_To",
	"core_From",
	"core_CallSid",
	"core_AccountSid",
	"core_CallStatus",
	"core_ApiVersion",
	"core_Direction",
	"core_CallerName",
  "core_CallTimestamp",
  "core_ForwardedFrom",
  "core_InstanceId",
  "core_ReferTarget",
  "core_Transferor",
  "core_Transferee",
	"core_Digits",
	"core_DialCallStatus",
	"core_DialCallSid",
	"core_DialCallDuration",
	"core_DialRingDuration",
	"core_RecordingUrl",
	"core_RecordingDuration",
	"core_PublicRecordingUrl",
	"core_SmsSid",
	"core_SmsStatus",
	"core_FaxSid",
	"core_FaxStatus",
	"core_Body",
];
export const VariableContext = React.createContext<
  Partial<VariableContextProp>
>({});