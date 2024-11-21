export type AppUrl = {
  domain: string;
  url: string;
  port: string;
};

type EmailSvcConfig = {
  enabled: boolean;
  serviceName: string;
  fromAddress: string;
  user: string;
  pass: string;
};

type RecaptchaConfig = {
  enabled: boolean;
  verifyUrl: string;
  publicKey: string;
  privateKey: string;
};

type DbConfig = {
  databaseUrl: string;
  pass: string;
};

export type Config = {
  emailService: EmailSvcConfig;
  recaptcha: RecaptchaConfig;
  db: DbConfig;
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
