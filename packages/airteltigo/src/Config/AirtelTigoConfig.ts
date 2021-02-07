interface IAirtelTigoConfiguration {
  ussdServerUrl: string;
  langId: string;
  encodingScheme: string;
  responseUrl: string;
}

const config: IAirtelTigoConfiguration = {
  ussdServerUrl:
    process.env.USSDSERVER_ENDPOINT || "http://ussdserver:8080/api",
  langId: process.env.LANGID || "1",
  encodingScheme: process.env.ENCODINGSCHEME || "0",
  responseUrl:
    process.env.AIRTELTIGO_RESPONSE_URL || "http://localhost:9001/error",
};

export default config;
