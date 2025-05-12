// 持久化管理器
class CacheManager {
  static instance: null | CacheManager = null;

  header: string = "CACHE_";
  tailer: string = "_DEADTIME";

  static getInstance() {
    if (!this.instance) {
      this.instance = new CacheManager();
    }
    return this.instance;
  }

  /**
   * setStorageCore
   * @param {*} key
   * @param {*} value
   * @param {*} time
   */
  setStorageCore(storageFn: Storage, key: string, value: unknown, seconds: number = 0) {
    const strKey = `${this.header}${key}`;
    const strTime = `${this.header}${key}${this.tailer}`;

    storageFn.setItem(strKey, JSON.stringify(value));
    if (seconds > 0) {
      let timestamp = new Date().getTime();
      timestamp = timestamp / 1000 + seconds;
      storageFn.setItem(strTime, String(timestamp));
    } else {
      storageFn.removeItem(strTime);
    }
  }

  /**
   * getStorageCore
   * @param {*} key
   * @returns
   */
  getStorageCore(storageFn: Storage, key: string) {
    const strKey = `${this.header}${key}`;
    const strTime = `${this.header}${key}${this.tailer}`;
    const deadtime = parseInt(storageFn.getItem(strTime) || "0");

    if (deadtime) {
      if (deadtime < new Date().getTime()) {
        return undefined;
      }
    }
    let res = storageFn.getItem(strKey);
    try {
      res = JSON.parse(res || "");
    } catch (e) {
      console.error("getSessionStorageSync", res, e);
    }

    return res;
  }

  /**
   * removeStorageCore
   * @param {*} key
   */
  removeStorageCore(storageFn: Storage, key: string) {
    const strKey = `${this.header}${key}`;
    const strTime = `${this.header}${key}${this.tailer}`;

    storageFn.removeItem(strKey);
    storageFn.removeItem(strTime);
  }

  /**
   * clearStorageCore
   */
  clearStorageCore(storageFn: Storage) {
    storageFn.clear();
  }

  /**
   * setLocalStorage
   */
  setLocalStorage(key: string, value: unknown, seconds: number = 0) {
    this.setStorageCore(window.localStorage, key, value, seconds);
  }

  /**
   * getLocalStorage
   */
  getLocalStorage(key: string) {
    this.getStorageCore(window.localStorage, key);
  }

  /**
   * removeLocalStorage
   */
  removeLocalStorage(key: string) {
    this.removeStorageCore(window.localStorage, key);
  }

  /**
   * clearLocalStorage
   */
  clearLocalStorage() {
    this.clearStorageCore(window.localStorage);
  }

  /**
   * setSessionStorage
   */
  setSessionStorage(key: string, value: unknown, seconds: number = 0) {
    this.setStorageCore(window.sessionStorage, key, value, seconds);
  }

  /**
   * getSessionStorage
   */
  getSessionStorage(key: string) {
    this.getStorageCore(window.sessionStorage, key);
  }

  /**
   * removeSessionStorage
   */
  removeSessionStorage(key: string) {
    this.removeStorageCore(window.sessionStorage, key);
  }

  /**
   * clearSessionStorage
   */
  clearSessionStorage() {
    this.clearStorageCore(window.sessionStorage);
  }
}

export default CacheManager.getInstance();
