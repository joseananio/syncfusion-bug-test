import { DashboardConfig } from './dashboard/dashboard-overview/dashboard-overview.component';

export class DashboardHelper {
  /**
   * Helper function as a workaround for incorrectly encoded image urls.
   */
  static normalizeUrl = (str: string) => {
    const ret = decodeURIComponent(str).replace(/\\/g, '/');
    return ret.startsWith('/uploads') || ret.includes('dashboard-empty.png') || ret.includes('base64') ? ret : `/uploads${ret}`;
  }
  // TODO [Baumgarten] the replace might need to be changed once backend fixes slash dir

  static dashboardConfigFromString = (config: string): DashboardConfig => {
    const _config = JSON.parse(config);
    let result;
    if (typeof _config === 'string') {
      result = JSON.parse(_config);
    } else {
      result = _config;
    }

    // sanitize settings
    const isAbsoluteUrl = new RegExp('^(?:[a-z]+:)?//', 'i');
    result.dashboards = result.dashboards.map((dashboard) => {
      if (dashboard.imageUrl) {
        // prevent loading of external resources
        dashboard.imageUrl = dashboard.imageUrl.match(isAbsoluteUrl) ? 'assets/img/dashboard-empty.png' : dashboard.imageUrl;
      }
      return dashboard;
    });

    return result;
  }

  // TODO (Reger): Remove escaping once backend accepts unescaped json-strings
  static dashboardConfigToEscapedString = (dashboardConfig: DashboardConfig) => {
    const _config = JSON.stringify(dashboardConfig);
    let config = _config.replace(/"/g, '\\"');
    // Backend needs further wrapping quotemarks
    config = `"${config}"`;
    return config;
  }
}
