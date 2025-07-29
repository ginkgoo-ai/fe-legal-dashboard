// 全局变量管理器
class GlobalManager {
  static instance: null | GlobalManager = null;

  siteName = 'Xeni';
  siteDescription = 'Xeni.Legal';
  versionExtension = '0.2.3';
  urlInstallExtension =
    'https://github.com/ginkgoo-ai/fe-chrome-extensions/releases/download/v0.2.3/xeni-pilot_20250728103139.zip';

  static getInstance() {
    if (!this.instance) {
      this.instance = new GlobalManager();
    }
    return this.instance;
  }
}

export default GlobalManager.getInstance();
