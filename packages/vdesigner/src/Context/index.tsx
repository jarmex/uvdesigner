import React, { useState } from "react";

type VariableContextProp = {
  variable: string[];
  setAppVariables: React.Dispatch<React.SetStateAction<string[]>>;
};
export const variablesValues = [
  "core_To",
  "core_From",
  "core_AccountSid",
  "core_Cellid",
  "core_Imsi",
  "core_Body",
];
export const VariableContext = React.createContext<
  Partial<VariableContextProp>
>({});

type VProps = {
  children: React.ReactNode;
};

/**
 * A variable provider context
 * @param children React.ReactNode
 * @returns React.ReactNode
 */
export const VariableProvider = ({ children }: VProps) => {
  const [appVariables, setAppVariables] = useState(variablesValues);
  return (
    <VariableContext.Provider
      value={{ variable: appVariables, setAppVariables }}
    >
      {children}
    </VariableContext.Provider>
  );
};

