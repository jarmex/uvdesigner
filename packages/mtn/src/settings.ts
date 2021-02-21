interface ISettings {
  timeOut: number;
  baseUrl: string;
  spPassword: string;
  timeStamp: string;
}
// setting mtn ussd
export const MtnSettings: ISettings = {
  timeOut: 30,
  baseUrl: "https://196.201.33.108:18310/",
  spPassword: "",
  timeStamp: "20200717143653",
};

export const ServiceUrl = {
  startUSSDNotification:
    "/USSDNotificationManagerService/services/USSDNotificationManager",
  stopUSSDNotification:
    "/USSDNotificationManagerService/services/USSDNotificationManager",
  sendUSSD: "/SendUssdService/services/SendUssd",
  sendUssdAbort: "/SendUssdService/services/SendUssd",
  redirectUSSD: "/RedirectUssdService/services/redirectUssd", // NOT IN GHANA
};
