import React, { useEffect, useContext, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { observer } from 'mobx-react';
import InputView from '../../components/inputView';
import Button from '../../components/button';
import style from '../../css/common.js';
import BasePage from '../../components/basePage';
import { delStorage } from '../../helper';

export default observer(({ navigation, route }) => {
  const { params } = route;
  const isEdit = !!params?.id;
  const { fontSize, backgroundColor, backgroundDisabled, fontDisabled } = useContext(CTX_THEME);
  const { cls } = useContext(CTX_WEBDAV);
  const [uri, setUri] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const disabled = useRef(true);
  const hasChange = useRef(false);
  const initVal = useRef({});
  useEffect(() => {
    if (cls !== undefined) {
      const { uri, username, password } = initVal.current = cls.getConfig();
      setUri(uri);
      setUsername(username);
      setPassword(password);
    }
  }, [cls]);
  useEffect(() => {
    const { uri: initUri, username: initUsername, password: initPwd } = initVal.current;
    disabled.current = !username || !password || !uri;
    hasChange.current = initUri !== uri || initUsername !== username || initPwd !== password;
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.headerRightBtnWrap, { backgroundColor: !disabled.current ? backgroundColor : backgroundDisabled }]}
            underlayColor={backgroundColor}
            disabled={disabled.current}
            activeOpacity={.6}
            onPress={() => {
              // delStorage('webdav');
              navigation.navigate('WebdavDir', {
                username,
                uri,
                password,
              });
            }}
          >
            <Text
              style={[style.headerRightBtnText, { color: !disabled.current ? '#fff' : fontDisabled, fontSize: fontSize * 0.875 }]}
            >下一步</Text>
          </Button>
        );
      },
    });
  }, [uri, username, password]);
  useFocusEffect(useCallback(() => {
    const back = navigation.addListener('beforeRemove', e => {
      if (hasChange.current) {
        e.preventDefault();
        Alert.alert('注意', '配置未完成，是否继续退出？', [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '确定',
            onPress: () => {
              hasChange.current = false;
              navigation.navigate('WebdavConfig');
            },
          },
        ]);
      }
    });
    return back;
  }, []));
  return (
    <BasePage>
      <ScrollView
        // 当点击事件被子组件捕获时，键盘不会自动收起。这样切换 TextInput 时键盘可以保持状态
        keyboardShouldPersistTaps='handled'
      >
        <View>
          <View style={styles.groupTitle}>
            <Text style={[styles.groupTitleText, { fontSize }]}>服务器地址</Text>
          </View>
          <View style={styles.groupInput}>
            <InputView
              placeholder='点这里输入WebDAV的链接地址'
              onChangeText={val => setUri(val)}
              value={uri}
              keyboardType='email-address'
              autoFocus={!isEdit}
              maxLength={50}
            />
          </View>
        </View>
        <View>
          <View style={styles.groupTitle}>
            <Text style={[styles.groupTitleText, { fontSize }]}>用户名</Text>
          </View>
          <View style={styles.groupInput}>
            <InputView
              placeholder='点这里输入用户名'
              onChangeText={val => setUsername(val)}
              value={username}
              keyboardType='email-address'
              autoFocus={false}
              maxLength={128}
            />
          </View>
        </View>
        <View>
          <View style={styles.groupTitle}>
            <Text style={[styles.groupTitleText, { fontSize }]}>密码</Text>
          </View>
          <View style={styles.groupInput}>
            <InputView
              placeholder='点这里输入密码'
              onChangeText={val => setPassword(val)}
              value={password}
              secureTextEntry={true}
              autoFocus={false}
              maxLength={128}
            />
          </View>
        </View>
      </ScrollView>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  groupTitle: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitleText: {
    color: '#353535',
  },
  groupInput: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  btnBox: {
    marginTop: 16,
    marginHorizontal: 10,
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
  },
  btn: {
    lineHeight: 46,
  },
});
