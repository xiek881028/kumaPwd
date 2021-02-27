import {
  DeviceEventEmitter,
  AppState,
} from 'react-native';
import FingerprintAndroid from '../NativeModules/FingerprintAndroid';
import { getStorage, setStorage } from '../helper';

export default class fingerprint {
  constructor(props = {}) {
    // 成功
    this.onSuccess = props.onSuccess ?? (() => { });
    // 不匹配
    this.onNotMatch = props.onNotMatch ?? (() => { });
    // 失败（达到最大尝试次数）
    this.onFailed = props.onFailed ?? (() => { });
    // 指纹识别被暂时锁定
    this.onLock = props.onLock ?? (() => { });
    // 指纹识别被占用
    this.onOccupy = props.onOccupy ?? (() => { });
    // 解决this指向问题
    this.switchAppFn = fingerprint.switchApp.bind(this);
  }

  static canUse() {
    return new Promise(resolve => {
      // 判断用户已经录入指纹且硬件可用
      FingerprintAndroid.isReady(data => resolve(data.flag));
    });
  }

  async open() {
    const fingerprinting = await getStorage('Fingerprinting');
    if (!fingerprinting) {
      await setStorage('Fingerprinting', true);
      FingerprintAndroid.toVerification();
    } else {
      return this.onOccupy();
    }
  }

  async close() {
    await setStorage('Fingerprinting', false);
    FingerprintAndroid.cancel();
  }

  async restart() {
    const fingerprinting = await getStorage('Fingerprinting');
    if (!fingerprinting) {
      await setStorage('Fingerprinting', true);
      FingerprintAndroid.cancel();
      FingerprintAndroid.toVerification();
    } else {
      return this.onOccupy();
    }
  }

  setListener(ops) {
    this.onSuccess = ops.onSuccess ?? this.onSuccess;
    this.onNotMatch = ops.onNotMatch ?? this.onNotMatch;
    this.onFailed = ops.onFailed ?? this.onFailed;
    this.onLock = ops.onLock ?? this.onLock;
    this.onOccupy = ops.onOccupy ?? this.onOccupy;
  }

  static async switchApp(appState) {
    //判断app是否在前台
    const fingerprinting = await getStorage('Fingerprinting');
    if (appState != 'active') {
      this.close();
      await setStorage('Fingerprinting', false);
    } else if (!fingerprinting) {// 在前台且没有在别的地方使用指纹识别
      this.restart();
    }
  }

  async addListener() {
    this.removeListener();
    const flag = await fingerprint.canUse();
    if(!flag) {
      throw new Error('设置不支持指纹识别或未录制指纹');
    }
    // 监听前后台切换
    AppState.addEventListener('change', this.switchAppFn);
    // 验证成功
    DeviceEventEmitter.addListener('onSucceed', async () => {
      this.onSuccess();
      await setStorage('Fingerprinting', false);
    });
    // 指纹不匹配，并返回可用剩余次数并自动继续验证
    DeviceEventEmitter.addListener('onNotMatch', () => {
      this.onNotMatch();
    });
    // 错误次数达到上限或者API报错停止了验证
    DeviceEventEmitter.addListener('onFailed', async () => {
      this.onFailed();
      await setStorage('Fingerprinting', false);
    });
    // 第一次调用startIdentify失败，因为设备被暂时锁定
    DeviceEventEmitter.addListener('onStartFailedByDeviceLocked', async () => {
      this.onLock();
      await setStorage('Fingerprinting', false);
    });
  }

  removeListener() {
    AppState.removeEventListener('change', this.switchAppFn);
    DeviceEventEmitter.removeAllListeners('onSucceed');
    DeviceEventEmitter.removeAllListeners('onNotMatch');
    DeviceEventEmitter.removeAllListeners('onFailed');
    DeviceEventEmitter.removeAllListeners('onStartFailedByDeviceLocked');
  }
};
