import React, { useState, useCallback, useContext } from 'react';
import {
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BasePage from '../../components/basePage';
import Page from './component/basePage';
import ModalRegister from './component/modalRegister';
import { observer } from 'mobx-react';
import styles from './css';
import { editPwd, sleep } from '../../helper';
import Button from '../../components/button';
import webdavCls from '../../helper/webdav';

export default observer(props => {
  const [info, setInfo] = useState({
    title: '首次使用，请设置密码',
    titleMode: undefined,
  });
  const [modalFlag, setModalFlag] = useState(false);
  const [keyboardLock, setKeyboardLock] = useState(false);// 锁键盘，为了更好的交互体验
  const { fontSize } = useContext(CTX_THEME);
  const { setUserFn } = useContext(CTX_USER);
  const { setWebdavFn } = useContext(CTX_WEBDAV);
  let firstPwd = [];
  const onInput = useCallback(async (pwd, setFn, resetPwd) => {
    if (keyboardLock) return;
    let _pwd = [...pwd];
    if (pwd.length >= 6) {
      if (firstPwd.length) {
        if (_pwd.join('') === firstPwd.join('')) {
          setFn(_pwd);
          await sleep(100, () => {// 沉睡100ms，为了在呈现上更友好
            const pwd = editPwd(_pwd.join(''));
            setInfo({
              title: '密码设置成功',
              titleMode: 'success',
            });
            setUserFn('pwd', pwd);
            setUserFn('isLogin', true);
            // 注册成功初始化webdav相关设置
            const webdav = new webdavCls({});
            setWebdavFn('cls', webdav);
            setWebdavFn('comp', webdav.complete);
          });
          setKeyboardLock(true);
        } else {
          firstPwd = [];
          setInfo({
            title: '两次输入不一致，请重新设置',
            titleMode: 'error',
          });
        }
      } else {
        firstPwd = [...pwd];
        setInfo({
          title: '请再次确认密码',
        });
      }
      _pwd = [];
      resetPwd();
    }
    setFn(_pwd);
  }, [keyboardLock]);
  return (
    <BasePage>
      <Page
        titleText={info.title}
        titleTextMode={info.titleMode}
        onInput={onInput}
        tipsChildren={(
          <Button
            activeOpacity={0.6}
            underlayColor='transparent'
            onPress={() => {
              setModalFlag(true);
            }}
          >
            <View style={styles.forgotPwdBox}>
              <Feather
                name='help-circle'
                style={[styles.forgotPwdIcon, { fontSize: fontSize * 1.125 }]}
              />
              <Text style={[styles.forgotPwdText, { fontSize }]}>我有备份</Text>
            </View>
          </Button>
        )}
      />
      <ModalRegister visible={modalFlag} onClose={flag => {
        setModalFlag(flag);
      }} />
    </BasePage>
  );
});
