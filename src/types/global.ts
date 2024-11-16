export type AppUrl = {
  domain: string;
  url: string;
  port: string;
};

export type Config = {
  emailService: {
    enabled: boolean;
    serviceName: string;
    fromAddress: string;
    user: string;
    pass: string;
  },
  recaptcha: {
    enabled: boolean;
    verifyUrl: string;
    publicKey: string;
    privateKey: string;
  },
  db: {
    databaseUrl: string;
  }
};

type ResponseProps = {
  promise?: Promise<unknown>;
  obj?: Record<string, unknown>;
  error?: string;
  file?: string;
};

declare global {
  var APP_URL: AppUrl;
  var CONFIG: Config;
  namespace Express {
    interface Request {
      getParam: (s: string) => unknown;
      getParams: Function;
      csrfToken: Function;
    }
    interface Response {
      responseProps: ResponseProps;
    }
  }
};
