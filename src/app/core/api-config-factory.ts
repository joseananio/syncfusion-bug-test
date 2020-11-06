import { Configuration, ConfigurationParameters } from './services';

/**
 * Sets the global config for swagger-generated services.
 * Those habe to be used as singletons, hence
 * imported here.
 */
export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    apiKeys: { Authorization: undefined },
  };

  return new Configuration(params);
}
