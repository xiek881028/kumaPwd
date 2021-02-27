// 因为RN没有实现crypto，调用链存在循环引用的问题，等待官方修复
// 相关链接：https://github.com/tradle/react-native-crypto/issues/30
import { createClient, axios, getPatcher } from 'webdav';
import path from 'path-browserify';
import moment from 'moment';
import { getStorage, setStorage } from './index';
import { encrypt, decrypt } from '../helper/crypto';
export default class webdav {
  uri = '';
  username = '';
  password = '';
  homeDir = '';
  key = '';
  complete = false;
  client;

  constructor(cfg) {
    cfg && this.init(cfg);
  }

  setConfig(cfg) {
    for (const key in cfg) {
      if (key === 'uri' || key === 'username' || key === 'password' || key === 'homeDir') {
        this[key] = cfg[key];
      }
    }
  }

  init(cfg) {
    this.setConfig(cfg);
    this.createClient();
    this.checkComp();
  }

  createClient() {
    // nextcloud的 webdav验证一旦验证通过，发送错误的 Authorization一样会通过验证，估计是加入ip白名单了。后续在研究，先简单实现
    // getPatcher().patch('request', aaa => {
    //   const _axios = axios.create();
    //   _axios.interceptors.request.use(cfg => {
    //     return cfg;
    //   });
    //   _axios.interceptors.response.use(cfg => {
    //     console.log('cfg: ', cfg);
    //     return cfg;
    //   });
    //   return _axios(aaa);
    // });
    this.client = createClient(this.uri, {
      username: this.username,
      password: this.password,
    });
  }

  async getFileTree(_path = '/') {
    return new Promise(async (resolve, reject) => {
      await this.client.getDirectoryContents(_path)
        .then(res => {
          const isRoot = path.parse(_path).root === _path;
          const out = {
            isRoot: path.parse(_path).root === _path,
            parentPath: isRoot ? undefined : path.join(_path, '../'),
            path: _path,
            type: 'dir',
            fileTree: [],
          };
          res.map(item => {
            const { basename: name, filename, etag: id, lastmod, size, type } = item;
            out.fileTree.push({
              lastTime: moment(lastmod).format('YYYY-MM-DD HH:mm:ss'),
              mode: type === 'directory' ? 'folder' : 'file',
              name,
              path: filename,
              id,
              size,
              disabled: type !== 'directory',
            });
          });
          resolve(out);
        })
        .catch(err => reject(err));
    });
  }

  async addDir(name) {
    return await this.client.createDirectory(name);
  }

  async upload(filename, data, saveHistory = false) {
    if (saveHistory) {
      try {
        const dir = path.dirname(filename);
        const extname = path.extname(filename);
        const dirList = await this.client.getDirectoryContents(dir);
        const backupList = [];
        // 筛选出备份文件
        dirList.map(item => {
          if (item.basename !== 'backup_latest.kuma' && path.extname(item.basename) === '.kuma') {
            backupList.push(item);
          }
        });
        // 按时间正序排序数组
        backupList.sort((a, b) => {
          return +moment(a.lastmod).format('x') < +moment(b.lastmod).format('x');
        });
        // 分离出超过10个的备份文件
        const delArr = backupList.slice(9);
        for (let i = 0, max = delArr.length; i < max; i++) {
          await this.client.deleteFile(delArr[i].filename);

        }
        const info = await this.client.stat(filename);
        await this.client.copyFile(filename, path.join(dir, `backup_${moment(info.lastmod).format('YYYYMMDDHHmmss')}${extname}`));
      } catch (error) {
        console.log('error: ', error);
        // 可能文件不存在
      }
    }
    return await this.client.putFileContents(filename, data);
  }

  async download(filename, cfg) {
    return await this.client.getFileContents(filename, cfg);
  }

  getConfig() {
    return {
      uri: this.uri,
      username: this.username,
      password: this.password,
      homeDir: this.homeDir,
    };
  }

  static async getOriginConfig(key) {
    const data = await getStorage('webdav');
    return new Promise((resolve, reject) => {
      if (data !== undefined) {
        const res = JSON.parse(data);
        const _pwd = decrypt(res.password, key);
        // 解密失败
        if (res.password && !_pwd) {
          console.log('res.password: ', res.password);
          console.log('_pwd: ', _pwd);
          reject('webdav密码解码失败');
        }
        resolve({
          uri: res.uri,
          username: res.username,
          password: _pwd,
          homeDir: res.homeDir,
        });
      } else {
        resolve({});
      }
    });
  }

  async saveConfig(key, data = {}) {
    this.setConfig(data);
    const save = this.getConfig();
    // 无密码时不做加密，避免解密失败
    save.password = this.password ? encrypt(this.password, key) : '';
    await setStorage('webdav', JSON.stringify(save));
  }

  checkComp() {
    this.complete = !!(this.uri && this.username && this.password && this.homeDir);
    return this.complete;
  }
};
