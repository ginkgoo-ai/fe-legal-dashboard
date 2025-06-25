// 全局变量管理器
class GlobalManager {
  static instance: null | GlobalManager = null;

  siteName = 'Ginkgoo.Legal';
  siteDescription = 'Ginkgoo.Legal';
  urlInstallExtension =
    'https://github.com/ginkgoo-ai/fe-chrome-extensions/releases/download/v0.1.2/fe-chrome-extensions-v20250625_122820.zip';

  static getInstance() {
    if (!this.instance) {
      this.instance = new GlobalManager();
    }
    return this.instance;
  }
}

export default GlobalManager.getInstance();
