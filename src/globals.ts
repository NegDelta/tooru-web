import nconf from 'nconf';
import path from 'path';

nconf.argv().env().file({ file: 'config.json' });

const parsedCfg = nconf.get();

interface Config {
  appRoot: string;
  restRoot: string;
  path: {
    [index: string]: string;
  };
  dbpool: {
    host: string;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
    connectTimeout: number;
  };
}

export const cfg = {
  ...parsedCfg,
  path: Object.fromEntries(
    Object.entries(
      parsedCfg.route as {
        [index: string]: string;
      }
    ).map(([name, appPath]) => [name, path.posix.join(parsedCfg.appRoot, appPath)])
  )
} as Config;
