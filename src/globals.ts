import nconf from 'nconf';

nconf.argv().env().file({ file: 'config.json' });

interface Config {
  appRoot: string;
  restRoot: string;
}

export const cfg: Config = nconf.get();
