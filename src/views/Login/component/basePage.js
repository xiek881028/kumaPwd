import React, { useState, useContext, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';
import { observer } from 'mobx-react';

//Css
import style from '../../../css/common.js';
import PwdWrap from './wrapPwd';
import InputKeyboard from './inputKeyBoard';

export default observer(props => {
  const {
    titleText,
    titleSubText,
    titleTextMode,
    titleSubTextMode,
    tipsChildren,
    keyboardChildren,
  } = props;
  const [pwd, setPwd] = useState([]);
  const { fontSize } = useContext(CTX_THEME);
  let pwdArr = [];
  const getKeybordVal = useCallback(pwd => {
    if (pwd == 'del') {
      pwdArr.pop();
    } else {
      pwdArr.push(pwd);
    }
    if (pwdArr.length >= 6) {
      pwdArr = pwdArr.slice(0, 6);
      (props.onDone ?? (() => { }))(pwdArr);
    }
    // 输入处理完全交予父级，暴露当前密码数组、设置输入框位数方法、重置密码方法
    (props.onInput ?? (() => setPwd([...pwdArr])))(pwdArr, setPwd, () => (pwdArr = []));
  }, [props.onDone, props.onInput]);
  return (
    <View style={[style.container]}>
      <StatusBar
        // translucent={true}
        backgroundColor='#ebebeb'
        barStyle='dark-content'
      >
      </StatusBar>
      <View style={[styles.loginBox]}>
        <View style={styles.topHalfBox}>
          <View style={styles.topHalf}>
            <Text style={[styles.titleText, titleTextMode == 'success' ? styles.titleTextSuccess : titleTextMode == 'error' ? styles.titleTextErr : '', { fontSize: fontSize * 1.25 }]}>
              {titleText ?? ''}
            </Text>
            <PwdWrap
              style={styles.inputPwd}
              number={6}
              pwd={pwd}
            />
            <View style={styles.tipsWrap}>
              {tipsChildren ?? <Text>&nbsp;</Text>}
            </View>
            {
              titleSubText ?
                <Text style={[styles.titleSubText, titleSubTextMode == 'success' ? styles.titleTextSuccess : '', { fontSize: fontSize * 1.1 }]}>
                  {titleSubText ?? ''}
                </Text>
                : null
            }
          </View>
          {keyboardChildren ?? null}
        </View>
        <InputKeyboard
          style={styles.InputKeyboard}
          getKeybordVal={getKeybordVal}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  loginBox: {
    justifyContent: 'space-between',
  },
  topHalfBox: {
    height: '50%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  topHalf: {
    alignItems: 'center',
  },
  tipsWrap: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 25,
    width: '100%',
  },
  titleText: {
    color: '#333',
    lineHeight: 36,
    marginTop: 25,
    paddingHorizontal: 25,
  },
  titleSubText: {
    color: '#E64340',
    lineHeight: 30,
    marginTop: 15,
    marginHorizontal: 25,
  },
  titleTextSuccess: {
    color: '#1AAD19',
  },
  titleTextErr: {
    color: '#E64340',
  },
  inputPwd: {
    marginTop: 36,
    marginHorizontal: 25,
    height: 50,
  },
  InputKeyboard: {
    height: '50%',
    // paddingHorizontal: 15,
  },
});
