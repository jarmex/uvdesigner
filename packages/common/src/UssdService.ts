import axios from "axios";
import { IConnectorData, IResponseData } from "./types";

export class UssdService {
  public async request(requestData: IConnectorData): Promise<IResponseData> {
    try {
      const { ussdServerUrl, ...bodyRest } = requestData;
      const { data } = await axios({
        url: ussdServerUrl,
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
}
