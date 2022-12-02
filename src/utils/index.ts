import { parse } from 'yaml';
import path = require('path');
import fs = require('fs');

export const getEnv = () => process.env.RUNNING_ENV;

export const getConfig = () => {
  const environment = getEnv();
  console.log(environment);
  const yamlPath = path.join(process.cwd(), `./.config/.${environment}.yaml`);
  const file = fs.readFileSync(yamlPath, 'utf8');
  const config = parse(file);
  return config;
};
