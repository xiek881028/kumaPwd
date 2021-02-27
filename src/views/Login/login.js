import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  Text,
  View,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import BasePage from '../../components/basePage';
import {
  getFingerprintFlag,
  login,
  // 下个版本删除 ~~~~~~~~
  loginV1,
  editPwd,
  // 下个版本删除 ~~~~~~~~
  getErrorPwdTime,
  getPwdTryMaxTimer,
  getErrorLockFlag,
  getLockInfo,
  setStorage,
  delStorage,
  sleep,
  mathLockTime,
} from '../../helper';
// 下个版本删除 ~~~~~~~~
import { reSaveDataV1, mathPwd, mathPwdV1 } from '../../helper/crypto';
// 下个版本删除 ~~~~~~~~
import Fingerprint from '../../helper/fingerprint';
import Page from './component/basePage';
import Button from '../../components/button';
import ModalForgot from './component/modalForgot';
import moment from 'moment';
import { observer } from 'mobx-react';
import styles from './css';

export default observer(({ route }) => {
  console.log(`~~~登录页 渲染~~~`);
  // 下个版本删除 ~~~~~~~~
  const { params } = route;
  const update = params?.update ?? false;
  // 下个版本删除 ~~~~~~~~
  const [renderFlag, setRenderFlag] = useState(false);
  const [info, setInfo] = useState({
    title: '',
    titleMode: undefined,
    sub: '',
  });
  const [modalFlag, setModalFlag] = useState(false);
  const [lock, setLock] = useState(null);
  const [keyboardLock, setKeyboardLock] = useState(false);
  const [hasFinger, setHasFinger] = useState(false);
  const { fontSize } = useContext(CTX_THEME);
  const { setUserFn, pwd: savePwd } = useContext(CTX_USER);
  // 下个版本删除 ~~~~~~~~
  const { setLoadingFn } = useContext(CTX_LOADING);
  // 下个版本删除 ~~~~~~~~
  const appLockTime = useRef();
  const pwdMaxTry = useRef();
  const lockFlag = useRef();
  const fingerprint = useRef(new Fingerprint());
  const mathUnlockTime = async (lockStartAt = null, appLockTime) => {
    let date = new Date(lockStartAt + (+appLockTime));
    const unlock = moment().isAfter(date);
    if (unlock) {
      await delStorage('lockStartAt');
      await delStorage('pwdTryTimer');
    }
    return {
      unlock,
      doneDate: unlock ? '' : moment(date).format('YYYY-MM-DD HH:mm:ss'),
    };
  };
  useEffect(useCallback(() => {
    (async () => {
      appLockTime.current = await getErrorPwdTime(); // app锁定时间
      pwdMaxTry.current = await getPwdTryMaxTimer(); // 密码最大尝试次数
      lockFlag.current = await getErrorLockFlag(); // 是否开启错误锁定标识
      const { pwdTryTimer, lockStartAt } = await getLockInfo();
      //没开启密码锁定功能 or 密码错误次数小于设置最大值
      if (!lockFlag.current || pwdTryTimer < pwdMaxTry.current) {
        setLock(false);
      } else {
        const { unlock, doneDate } = await mathUnlockTime(lockStartAt, appLockTime.current);
        // 之前已锁定但锁定时间已过期
        if (unlock) {
          setLock(false);
        } else {
          setLock(doneDate);
        }
      }
    })();
    setRenderFlag(true);
    return () => {
      fingerprint.current.close();
      fingerprint.current.removeListener();
    };
  }, []), []);
  // 锁定状态差异处理effect
  useEffect(() => {
    // 避免初次渲染不知道lock状态重复渲染并可能错误打开指纹识别的问题
    if (lock === null) return;
    const fingerFn = () => {
      fingerprint.current.setListener({
        // 验证成功
        onSuccess() {
          loginSuccess();
        },
        // 指纹不匹配，并返回可用剩余次数并自动继续验证
        onNotMatch() {
          setInfo({
            title: '指纹错误，请重新验证',
            titleMode: 'error',
          });
        },
        // 错误次数达到上限或者API报错停止了验证
        onFailed() {
          setInfo({
            title: '请输入密码',
            sub: '指纹验证错误达到上限，指纹识别已被系统暂时锁定',
          });
        },
        // 第一次调用startIdentify失败，因为设备被暂时锁定
        onLock() {
          setInfo({
            title: '请输入密码',
            sub: '指纹验证错误达到上限，指纹识别已被系统暂时锁定',
          });
        },
      });
      fingerprint.current.addListener();
      fingerprint.current.open();
    };
    (async () => {
      const fingerFlag = await getFingerprintFlag(); // 是否开启指纹识别
      if (lock) {
        setHasFinger(false);
        fingerprint.current.close();
        fingerprint.current.removeListener();
        setKeyboardLock(true);
        setInfo({
          title: '应用已经被锁定',
          titleMode: 'error',
          sub: `将在 ${lock} 解锁`,
        });
      } else {
        // 下个版本删除 ~~~~~~~~
        if (update) {
          setHasFinger(false);
          setKeyboardLock(false);
          setInfo({
            title: '加密算法更新，请验证密码',
            sub: '',
          });
          return;
        }
        // 下个版本删除 ~~~~~~~~
        setHasFinger(fingerFlag);
        setKeyboardLock(false);
        setInfo({
          title: `请${fingerFlag ? '验证指纹或' : ''}输入密码`,
          sub: '',
        });
        if (fingerFlag) {
          fingerFn();
        }
      }
    })();
  }, [lock]);
  // 键盘输入事件
  const onInput = useCallback(async (pwd, setPwd, reset) => {
    if (keyboardLock) return;
    setPwd([...pwd]);
    if (pwd.length >= 6) {
      setKeyboardLock(true); // 匹配密码前锁键盘并延时100ms，为了更好的用户体验
      await sleep(100);
      let verify = login(pwd.join(''), savePwd);
      // 下个版本删除 ~~~~~~~~
      if (update) {
        verify = loginV1(pwd.join(''), savePwd);
        if (verify) {
          setLoadingFn(true, '数据更新中...');
          await editPwd(pwd.join(''));
          const list = await storage.getAllDataForKey('accountList');
          const prevPwd = mathPwdV1(pwd.join(''));
          const savePwd = mathPwd(pwd.join(''));
          for (let i = 0, max = list.length; i < max; i++) {
            await reSaveDataV1(list[i], prevPwd, savePwd);
          }
          setPwd([]);
          reset();
          setKeyboardLock(false);
          await sleep(1500);
          setLoadingFn(false);
          loginSuccess();
          return;
        }
      }
      // 下个版本删除 ~~~~~~~~
      if (verify) {
        loginSuccess();
      } else {
        const { pwdTryTimer } = await getLockInfo();
        const nowTimer = +pwdTryTimer + 1;
        const now = new Date().getTime();
        if (lockFlag.current) { // 更新输入错误次数与锁定开始时间
          await setStorage('pwdTryTimer', nowTimer);
          await setStorage('lockStartAt', now);
        }
        if (lockFlag.current && nowTimer >= pwdMaxTry.current) {
          const { doneDate } = await mathUnlockTime(now, appLockTime.current);
          setLock(doneDate);
        } else {
          setInfo({
            title: '密码错误，请重新输入',
            titleMode: 'error',
            sub: lockFlag.current ? `已经连续输错密码 ${nowTimer} 次，累计输错 ${pwdMaxTry.current} 次，应用将锁定${mathLockTime(+appLockTime.current)}。` : '',
          });
          setPwd([]);
          reset();
          setKeyboardLock(false);
        }
      }
    }
  }, [keyboardLock]);
  const loginSuccess = async () => {
    setKeyboardLock(true);
    setInfo({
      title: '登录成功',
      titleMode: 'success',
      sub: '',
    });
    await delStorage('lockStartAt');
    await delStorage('pwdTryTimer');
    setUserFn('isLogin', true);
  };
  return renderFlag ? (
    <BasePage>
      <Page
        titleText={info.title}
        titleTextMode={info.titleMode}
        titleSubText={info.sub}
        onInput={onInput}
        keyboardChildren={hasFinger ? (
          <View style={[styles.fingerprintBox]} >
            <Entypo
              name='fingerprint'
              style={styles.fingerprintIcon}
            />
            <Text style={{ fontSize }} >
              指纹识别已开启
            </Text>
          </View>
        ) : null}
        tipsChildren={(
          <Button
            activeOpacity={0.6}
            underlayColor='transparent'
            onPress={async () => {
              setModalFlag(true);
            }}
          >
            <View style={styles.forgotPwdBox}>
              <Feather
                name='help-circle'
                style={[styles.forgotPwdIcon, { fontSize: fontSize * 1.125 }]}
              />
              <Text style={[styles.forgotPwdText, { fontSize }]}>忘记密码</Text>
            </View>
          </Button>
        )}
      />
      <ModalForgot visible={modalFlag} onClose={flag => {
        setModalFlag(flag);
      }} />
    </BasePage>
  ) : null;
});
