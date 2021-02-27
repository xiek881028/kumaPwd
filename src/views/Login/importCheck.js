import React, { useState, useCallback, useContext } from 'react';
import { decrypt, decryptV1, reSaveData, reSaveDataV1 } from '../../helper/crypto';
import BasePage from '../../components/basePage';
import Page from './component/basePage';
import { observer } from 'mobx-react';
import {
  PermissionsAndroid,
} from 'react-native';
import {
  sleep,
  checkAndRequestPermissionAndroid,
  initMkdir,
  writeFile,
  getTimerFileName,
} from '../../helper';
import { mathPwd, mathPwdV1 } from '../../helper/crypto';
import FilesAndroid from '../../NativeModules/FilesAndroid';

export default observer(({ route, navigation }) => {
  console.log(`~~~导入验证页 渲染~~~`);
  const rootPath = FilesAndroid.ROOT_PATH;
  const [info, setInfo] = useState({
    title: '请输入密码',
    sub: '注意：请输入导出备份文件时的密码，而不是当前的密码',
  });
  const [keyboardLock, setKeyboardLock] = useState(false);// 锁键盘，为了更好的交互体验
  const { pwd: savePwd } = useContext(CTX_USER);
  const { setTipsFn } = useContext(CTX_TIPS);
  const { cls, setListFn, setTagFn } = useContext(CTX_LIST);
  const onInput = useCallback(async (pwd, setFn, resetPwd) => {
    if (keyboardLock) return;
    let _pwd = [...pwd];
    setFn(_pwd);
    if (pwd.length >= 6) {
      const { params } = route;
      const { mode, data } = params;
      // 下个版本删除 ~~~~~~~~
      const { old } = params;
      // 下个版本删除 ~~~~~~~~
      let dataList = '';
      let prevPwd = mathPwd(pwd.join(''));
      let decryptFlag = false;
      // 下个版本删除 ~~~~~~~~
      if (old) {
        prevPwd = mathPwdV1(pwd.join(''));
        try {
          dataList = decryptV1(data, prevPwd);
          decryptFlag = true;
        } catch (err) {
          // 解码失败
        }
        // 下个版本删除 ~~~~~~~~
      } else {
        try {
          dataList = decrypt(data, prevPwd);
          decryptFlag = true;
        } catch (err) {
          // 解码失败
        }
      }
      if (decryptFlag) {
        setKeyboardLock(true); // 匹配密码前锁键盘并延时100ms，为了更好的用户体验
        setInfo({
          title: '数据导入中',
          titleMode: 'success',
          sub: '注意：请耐心等待，中途退出您有可能失去所有的账号！',
        });
        await sleep(100);
        let decryptData = JSON.parse(dataList);
        let newData = {};
        if (Array.isArray(decryptData)) {
          newData.accountList = decryptData;
          newData.tags = [];
        } else {
          newData = decryptData;
        }
        const errArr = [];
        const successArr = [];
        const appendArr = [];
        const errTagArr = [];
        const successTagArr = [];
        const appendTagArr = [];

        const { accountList, tags } = newData;
        // 导入tag
        for (let i = 0, max = tags.length; i < max; i++) {
          const el = tags[i];
          if (mode == 'cover') {
            try {
              await cls.tagAdd(el, false);
              successTagArr.push('');
            } catch (error) {
              errTagArr.push({
                data: el,
                error
              });
            }
          } else if (mode == 'append') {
            storage.load({
              key: 'tagList',
              id: el.id,
            }).catch(err => {
              appendTagArr.push(el);
            });
          }
        }
        for (let i = 0, max = accountList.length; i < max; i++) {
          if (mode == 'cover') {
            try {
              // 下个版本删除 ~~~~~~~~
              if (old) {
                await reSaveDataV1(accountList[i], prevPwd, savePwd);
                // 下个版本删除 ~~~~~~~~
              } else {
                await reSaveData(accountList[i], prevPwd, savePwd);
              }
              successArr.push('');
            } catch (error) {
              errArr.push(error);
            }
          } else if (mode == 'append') {
            storage.load({
              key: 'accountList',
              id: accountList[i].id,
            }).catch(err => {
              appendArr.push(accountList[i]);
            });
          }
        }
        if (mode == 'cover') {
        } else if (mode == 'append') {
          appendArr.length && appendArr.map(async item => {
            try {
              if (old) {
                await reSaveDataV1(item, prevPwd, savePwd);
              } else {
                await reSaveData(item, prevPwd, savePwd);
              }
              successArr.push('');
            } catch (error) {
              errArr.push(error);
            }
          });
          appendTagArr.length && appendTagArr.map(async item => {
            try {
              await cls.tagAdd(item, false);
              successTagArr.push('');
            } catch (error) {
              errTagArr.push(error);
            }
          });
        }
        await sleep(100);
        setTipsFn('timer', 5000);
        let write = false;
        if (errArr.length) {
          let hasPermission = await checkAndRequestPermissionAndroid([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
          if (hasPermission) {
            const dir = await initMkdir('log');
            let str = '';
            errArr.map(item => {
              const { account, name } = item.data;
              return str += `导入：${name}-${account}\n失败：${item.error}\n\n`;
            });
            errTagArr.map(item => {
              const { name } = item.data;
              return str += `导入标签：${name}\n失败：${item.error}\n\n`;
            });
            const res = await writeFile(dir.saveFile, `${getTimerFileName('导入错误日志')}.log`, str);
            if (res.flag) write = true;
          }
        }
        // 下个版本删除 ~~~~~~~~
        setTipsFn('text', `共导入 ${successArr.length} 条数据，${errArr.length} 条失败${old ? '' : `；共导入 ${successTagArr.length} 个标签，${errTagArr.length} 个失败`}${(errArr.length || errTagArr.length) && write ? `。失败日志存放于\n${rootPath}/kumaPwd/log` : ''}`);
        // 下个版本删除 ~~~~~~~~
        await cls.init();
        setListFn(cls.viewList);
        setTagFn(cls.tagViewList);
        navigation.popToTop();
      } else {
        setInfo({
          title: '密码错误，请重新输入',
          titleMode: 'error',
        });
        setKeyboardLock(false);
      }
      setFn([]);
      resetPwd();
    }
  }, [keyboardLock]);
  return (
    <BasePage>
      <Page
        titleText={info.title}
        titleTextMode={info.titleMode}
        titleSubText={info.sub}
        onInput={onInput}
      />
    </BasePage>
  );
});
