import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import BasePage from '../../components/basePage';
import Page from './component/basePage';
import { observer } from 'mobx-react';
import {
  PermissionsAndroid,
} from 'react-native';
import {
  editPwd,
  sleep,
  login,
  getLockInfo,
  setStorage,
  delStorage,
  getErrorPwdTime,
  getPwdTryMaxTimer,
  getErrorLockFlag,
  mathLockTime,
  initMkdir,
  writeFile,
  getTimerFileName,
  checkAndRequestPermissionAndroid,
} from '../../helper';
import ModalAsyncWebdav from './component/modalAsyncWebdav';
import { reSaveData } from '../../helper/crypto';
import FilesAndroid from '../../NativeModules/FilesAndroid';

export default observer(props => {
  console.log(`~~~修改密码页 渲染~~~`);
  const { setUserFn, pwd: savePwd } = useContext(CTX_USER);
  const [renderFlag, setRenderFlag] = useState(false);
  const { cls: webdavCls, comp, webdavFlag } = useContext(CTX_WEBDAV);
  const { setLoadingFn } = useContext(CTX_LOADING);
  const { cls } = useContext(CTX_LIST);
  const { setTipsFn } = useContext(CTX_TIPS);
  const { pwd: prevPwd } = useContext(CTX_USER);
  const [info, setInfo] = useState({
    title: '请输入密码',
    titleMode: undefined,
  });
  const appLockTime = useRef();
  const pwdMaxTry = useRef();
  const lockFlag = useRef();
  const firstPwd = useRef([]);
  const [step, setStep] = useState(0);
  const [modalFlag, setModalFlag] = useState(false);
  const [keyboardLock, setKeyboardLock] = useState(false);// 锁键盘，为了更好的交互体验
  useEffect(() => {
    (async () => {
      appLockTime.current = await getErrorPwdTime(); // app锁定时间
      pwdMaxTry.current = await getPwdTryMaxTimer(); // 密码最大尝试次数
      lockFlag.current = await getErrorLockFlag(); // 是否开启错误锁定标识
      if (webdavFlag && comp) {
        setModalFlag(true);
      }
      setRenderFlag(true);
    })();
  }, [comp, webdavFlag]);
  const onInput = useCallback(async (pwd, setFn, resetPwd) => {
    if (keyboardLock) return;
    let _pwd = [...pwd];
    setFn(_pwd);
    if (pwd.length >= 6) {
      if (step === 0) {
        setKeyboardLock(true); // 匹配密码前锁键盘并延时100ms，为了更好的用户体验
        await sleep(100);
        if (login(pwd.join(''), savePwd)) {
          setStep(1);
          setKeyboardLock(false);
          setInfo({
            title: '请设置新密码',
          });
          await delStorage('lockStartAt');
          await delStorage('pwdTryTimer');
        } else {
          const { pwdTryTimer } = await getLockInfo();
          const nowTimer = +pwdTryTimer + 1;
          const now = new Date().getTime();
          if (lockFlag.current) { // 更新输入错误次数与锁定开始时间
            await setStorage('pwdTryTimer', nowTimer);
            await setStorage('lockStartAt', now);
          }
          if (lockFlag.current && nowTimer >= pwdMaxTry.current) {
            setUserFn('isLogin', false);
          } else {
            setInfo({
              title: '密码错误，请重新输入',
              titleMode: 'error',
              sub: lockFlag.current ? `已经连续输错密码 ${nowTimer} 次，累计输错 ${pwdMaxTry.current} 次，应用将锁定${mathLockTime(+appLockTime.current)}。` : '',
            });
            setKeyboardLock(false);
          }
        }
      } else if (step === 1) {
        firstPwd.current = [...pwd];
        setInfo({
          title: '请再次确认密码',
        });
        setStep(2);
      } else if (step === 2) {
        if (_pwd.join('') === firstPwd.current.join('')) {
          setKeyboardLock(true);
          setFn(_pwd);
          const list = await cls.getOriginList();
          const pwd = editPwd(_pwd.join(''));
          setUserFn('pwd', pwd);
          if (list.length) {
            setInfo({
              title: '正在用新密码对账号重新加密，请勿退出，否则您将有可能失去您所有的账号！',
              titleMode: 'error',
            });
            setLoadingFn(true, '正在加密...');
            const errArr = [];
            await sleep(1500, async () => {// 沉睡1500ms，为了在呈现上更友好
              for (let i = 0, max = list.length; i < max; i++) {
                try {
                  await reSaveData(list[i], prevPwd, pwd);
                } catch (error) {
                  errArr.push(error);
                }
              }
              setLoadingFn(false, '');
              webdavCls && await webdavCls.saveConfig(pwd);
              await cls.init();
              if (errArr.length) {
                let hasPermission = await checkAndRequestPermissionAndroid([
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ]);
                if (hasPermission) {
                  const rootPath = FilesAndroid.ROOT_PATH;
                  const dir = await initMkdir('log');
                  let str = '';
                  errArr.map(item => {
                    const { account, name } = item.data;
                    return str += `${name}-${account}\n失败：${item.error}\n\n`;
                  });
                  const res = await writeFile(dir.saveFile, `${getTimerFileName('修改密码错误日志')}.log`, str);
                  res && setTipsFn('text', `重新加密账号失败，失败日志存放于\n${rootPath}/kumaPwd/log`);
                }
              }
            });
          }
          setInfo({
            title: '密码设置成功',
            titleMode: 'success',
          });
          await sleep(500, () => props.navigation.pop());
        } else {
          setInfo({
            title: '两次输入不一致，请重新设置',
            titleMode: 'error',
          });
          setStep(1);
        }
        firstPwd.current = [];
      }
      setFn([]);
      resetPwd();
    } else {
      // resetStep();
    }
  }, [keyboardLock, step]);
  return renderFlag ? (
    <BasePage>
      <Page
        titleText={info.title}
        titleTextMode={info.titleMode}
        titleSubText={info.sub}
        onInput={onInput}
      />
      <ModalAsyncWebdav
        visible={modalFlag}
        onClose={async flag => {
          setModalFlag(false);
          if (!flag) {
            props.navigation.pop();
          }
        }}
      />
    </BasePage>
  ) : null;
});
