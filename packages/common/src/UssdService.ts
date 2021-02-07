import axios from "axios";
import { Connector, IConnectorData, IGenericObj, IResponseData } from "./types";

export class UssdService {
  public async request(requestData: IConnectorData): Promise<IResponseData> {
    try {
      const { ussdServerUrl, ...bodyRest } = requestData;
      const { data } = await axios({
        baseURL: ussdServerUrl,
        url: "ussd",
        method: "POST",
        data: bodyRest,
      });
      const { connector, isContinue, message, ...rest } = data;
      return {
        connector,
        isContinue,
        message,
        ...rest,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * use this method to get the configuration from USSD Server
   *
   * @param {string} url
   * @returns {Promise<Object>}
   */
  public async getSetting(
    url: string,
    connector: Connector
  ): Promise<IGenericObj> {
    try {
      const settingurl = `${url}/settings/${connector.toLowerCase()}`;
      const { data } = await axios.post(settingurl, { connector });
      return data;
    } catch (error) {
      throw error;
    }
  }
}
