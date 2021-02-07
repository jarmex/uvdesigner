import { useEffect, useReducer, useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ActionTypes, fetchReducer, initResponse } from "./reducer";

interface IOptions {
  manual: boolean;
  [key: string]: any;
}
interface IAxiosData extends AxiosRequestConfig {
  options?: IOptions;
}
type AxiosDataProps = IAxiosData | (() => IAxiosData);

const useAxios = (req: AxiosDataProps) => {
  const [state, dispatch] = useReducer(fetchReducer, initResponse);
  const baseUrl =
    process.env.REACT_APP_USSD_SERVICE_BASE_URL || "http://ussdserver:8080/api";
  let config: AxiosRequestConfig = {
    baseURL: baseUrl,
    withCredentials: true,
  };

  if (typeof req === "function") {
    const result = req();
    config = { ...config, ...result };
  } else {
    config = { ...config, url: req.url, method: req.method };

    if (req.data) {
      config.data = req.data;
    }
  }

  const fetchData = async (options: any = {}) => {
    try {
      dispatch({ type: ActionTypes.Start });
      const updateConfig = { ...config, ...options };

      const { data, status, statusText } = await axios(updateConfig);
      dispatch({
        type: ActionTypes.Success,
        payload: { data, status, statusText },
      });
    } catch (error) {
      if (error.response) {
        let msg = error.message;
        if (error.response.data) {
          msg = error.response.data.message;
        }
        const err = new Error(msg);
        dispatch({ type: ActionTypes.Fail, payload: err });
      } else if (error.request) {
        dispatch({
          type: ActionTypes.Fail,
          payload: new Error("No response from the server"),
        });
      } else {
        dispatch({ type: ActionTypes.Fail, payload: error });
      }
    }
  };

  const requestSync = async (
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<any> | undefined> => {
    try {
      let nConfig: AxiosRequestConfig;
      if (options) {
        nConfig = { ...config, ...options };
        return axios(nConfig);
      }
    } catch (error) {
      throw error;
    }
  };

  const request = useCallback(
    (options: any = {}) => {
      fetchData(options);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [req]
  );

  useEffect(() => {
    let isManual: boolean = false;
    if (typeof req === "function") {
      const result = req();
      if (result.options && result.options.manual) {
        isManual = result.options.manual;
      }
    } else {
      if (req.options) {
        isManual = req.options.manual;
      }
    }
    if (isManual === false) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, requestSync, request };
};

export default useAxios;
