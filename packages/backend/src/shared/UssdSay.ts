import {ReplaceVariables} from './ReplaceVariables';
import {IGenericObj} from './types';


export default class UssdSaySteps {
  process = async (step: any, appdata = {}, tempdata = {}) => {
    const retmsg: IGenericObj = {};

    const { text } = step;

    retmsg.message = ReplaceVariables(text, appdata, tempdata);

    return retmsg;
  };
}

