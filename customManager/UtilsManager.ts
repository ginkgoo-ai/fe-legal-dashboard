/**
 * @description 工具方法管理器
 */
class UtilsManager {
  static instance: UtilsManager | null = null;

  static getInstance(): UtilsManager {
    if (!this.instance) {
      this.instance = new UtilsManager();
    }
    return this.instance;
  }

  stopEventDefault = (e: Event): void => {
    e.stopPropagation();
    e.preventDefault();
  };

  router2Params = (
    strRouter: string,
    options?: Record<string, unknown>
  ): Record<string, unknown> => {
    const { decode = true } = options || {};
    const strRouterTmp = strRouter || '';
    let strResultPath = strRouterTmp;
    const objResultParam: Record<string, unknown> = {};

    const nIndexPath = strRouterTmp.indexOf('?');
    if (nIndexPath >= 0) {
      strResultPath = strRouterTmp.substring(0, nIndexPath);
      const strParam = strRouterTmp.slice(nIndexPath + 1);
      const arrParam = strParam.split('&');
      // console.log('router2Params', strResultPath, strParam, arrParam)

      arrParam.forEach(strItem => {
        const nIndexParam = strItem.indexOf('=');
        if (nIndexParam >= 0) {
          const strParamKey = strItem.substring(0, nIndexParam);
          const strParamValue = strItem.slice(nIndexParam + 1);
          objResultParam[strParamKey] = decode
            ? decodeURIComponent(strParamValue)
            : strParamValue;
        }
      });
    }
    // console.log('router2Params', objResultParam)

    return {
      path: strResultPath,
      params: objResultParam,
    };
  };

  router2url = (strPath: string, objParams: Record<string, unknown> = {}): string => {
    let strResult = strPath;
    let isFirstParam = !strPath.includes('?');

    for (const key in objParams) {
      if (isFirstParam) {
        strResult += `?${key}=${objParams[key]}`;
        isFirstParam = false;
      } else {
        strResult += `&${key}=${objParams[key]}`;
      }
    }

    return strResult;
  };

  navigateTo = (url: string, params?: Record<string, string>) => {
    if (!window) {
      return;
    }
    const [html, _] = window?.location?.href?.split('#') || [];
    const path = this.router2url(url, params);
    const href = `${html}#${path}`;

    console.log('navigateTo', href, html, path);
    window.location.href = href;
  };

  redirectTo = (url: string, params?: Record<string, string>) => {
    if (!window) {
      return;
    }
    const [html, _] = window?.location?.href?.split('#') || [];
    const path = this.router2url(url, params);
    const href = `${html}#${path}`;

    console.log('redirectTo', href, html, path);
    window.location.replace(href);
  };

  navigateBack = () => {
    if (!window) {
      return;
    }
    window.history.back();
  };
}

export default UtilsManager.getInstance();
