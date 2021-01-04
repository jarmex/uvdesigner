import * as moment from "moment";

export const getCurrentTime = () => {
    const now = moment();
    // const localDateGenerated = now.local().format('DD MMM YYYY hh:mm A') + ' ' + String(now.local()._d).split(' ')[5];

    return now.toString();
};
