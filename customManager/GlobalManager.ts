// 全局变量管理器
class GlobalManager {
  static instance: null | GlobalManager = null;

  siteName = 'Ginkgoo.Legal';
  siteDescription = 'Ginkgoo.Legal';
  versionExtension = '0.1.14';
  urlInstallExtension =
    'https://github.com/ginkgoo-ai/fe-chrome-extensions/releases/download/v0.1.14/fe-chrome-extensions_20250715082359.zip';

  static getInstance() {
    if (!this.instance) {
      this.instance = new GlobalManager();
    }
    return this.instance;
  }
}

export default GlobalManager.getInstance();
