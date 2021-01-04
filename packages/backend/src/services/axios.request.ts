import axios from "axios";
import { IGenericObj } from "../shared/types";

export interface IAxiosResponse {
    status: number;
    statusText: string;
    requestId: string;
}

type IRequest = (request: IGenericObj, url: string | undefined) => Promise<IAxiosResponse>;

export const axiosRequest: IRequest = async (request: IGenericObj, url: string | undefined) => {
    try {
        if (!url) {
            throw new Error("Undefined URL.");
        }

        const response = await axios({
            method: "POST",
            url,
            headers: {
                "Content-Type": "application/json",
            },
            data: request,
        });
        return {
            status: response.status,
            statusText: response.statusText,
            requestId: request.requestId,
        };
    } catch (error) {
        throw error;
    }
};
