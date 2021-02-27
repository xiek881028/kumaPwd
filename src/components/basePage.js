import React, { useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Text,
  BackHandler,
} from 'react-native';
import { observer } from 'mobx-react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { title } from '../config';
//Css
import style from '../css/common.js';

export default observer(props => {
  const { fontSize } = useContext(CTX_THEME);
  const { isLogin } = useContext(CTX_USER);
  const { setLoadingFn } = useContext(CTX_LOADING);
  const { timer, setTipsFn } = useContext(CTX_TIPS);
  const navigation = useNavigation();
  const route = useRoute();
  // 返回按钮
  useFocusEffect(useCallback(() => {
    // 未登录 && 可以返回上一层页面 不需要二次确认退出
    if (!isLogin || navigation.canGoBack()) {
      // 切换页面关闭loading蒙层
      setLoadingFn(false, '');
      return;
    };
    if (OS === 'android') {
      let changeFlag = false;
      let exifFlag = false;
      const goBack = () => {
        if (!exifFlag) {
          changeFlag = true;
          setTipsFn('text', '再按一次退出');
          setTimeout(() => {
            exifFlag = false;
          }, timer);
        }
        exifFlag = !exifFlag;
        return exifFlag;
      };
      BackHandler.addEventListener('hardwareBackPress', goBack);
      return () => {
        if (changeFlag) {// 如果是退出的tips操作，切换页面隐藏tips
          setTipsFn('text', '');
        }
        exifFlag = false;
        BackHandler.removeEventListener('hardwareBackPress', goBack);
      };
    }
  }, []));
  useEffect(() => {
    navigation.setOptions({
      headerTitle: (<Text>{title[route.name]}</Text>),
      headerTitleContainerStyle: route.name === 'Home' ? [] : [styles.headerBackTitle],
      headerTitleStyle: [
        style.headerTitleStyle,
        { marginHorizontal: 0, marginLeft: 0, paddingLeft: 0, fontSize: fontSize * 1.25 },
      ],
      // headerTitleStyle: [{ fontSize }],
    });
  }, [fontSize]);
  return (
    <>
      <StatusBar
        backgroundColor={style.headerStyle.backgroundColor}
        barStyle='dark-content'
      >
      </StatusBar>
      <SafeAreaView style={styles.warp}>
        {props.children}
      </SafeAreaView>
    </>
  );
});

const styles = StyleSheet.create({
  warp: {
    flex: 1,
  },
  headerBackTitle: {
    left: 45,
  },
});
