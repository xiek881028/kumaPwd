import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { observer } from 'mobx-react';
import BasePage from '../../components/basePage';
import Button from '../../components/button';
import { version, changeList } from '../../config';
import { setStorage, delStorage } from '../../helper';
import style from '../../css/common';

export default observer(({ navigation }) => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const { setTipsFn } = useContext(CTX_TIPS);
  const { pwd } = useContext(CTX_USER);
  return (
    <BasePage>
      <ScrollView>
        <View style={[styles.wrap]}>
          <Image
            source={require('../../images/icon.png')}
            style={styles.kumaIcon}
          />
          <Text style={[styles.title, { fontSize: fontSize * 1.4 }]}>更新说明</Text>
          <Text style={[styles.sub, { fontSize: fontSize * 1.2 }]}>{version}</Text>
          <View style={[styles.list]}>
            {changeList.map((item, index) => {
              if (typeof item === 'string') {
                return (
                  <View style={[styles.textWrap]} key={index}>
                    <Text style={[{ fontSize }]}>{`${index + 1}、`}</Text>
                    <Text style={[styles.listText, { fontSize }]}>{item}</Text>
                  </View>
                );
              } else {
                const { text, mode } = item;
                return (
                  <View style={[styles.textWrap]} key={index}>
                    <Text style={[{ fontSize }]}>{`${index + 1}、`}</Text>
                    <Text style={[styles.listText, mode === 'warning' ? style.warningColor : '', { fontSize }]}>{text}</Text>
                  </View>
                );
              }
            })}
          </View>
        </View>
      </ScrollView>
      <Button
        mode='android'
        androidColor={backgroundColor}
        style={[styles.btnWrap, { backgroundColor }]}
        onPress={async () => {
          setTipsFn('timer', 5000);
          setTipsFn('text', '如需再次查看请前往 设置-关于-更新说明');
          setStorage('version', version);
          // 下个版本删除 ~~~~~~~~
          // 重置所有设置
          delStorage('autoBackupFlag');
          delStorage('backHoldFlag');
          delStorage('backHoldTime');
          delStorage('autoBacerrorPwdFlagkupFlag');
          delStorage('errorPwdNum');
          delStorage('errorPwdTime');
          delStorage('fingerprintFlag');
          // 下个版本删除 ~~~~~~~~
          navigation.replace(pwd ? 'Login' : 'Register', { update: true });
        }}
      >
        <Text style={[styles.btnText, { fontSize: fontSize * 1.1 }]}>关闭</Text>
      </Button>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '10%',
    paddingBottom: 80,
  },
  kumaIcon: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  title: {
    color: '#666',
  },
  sub: {
    color: '#999',
  },
  list: {
    marginTop: 20,
    width: '88%',
  },
  textWrap: {
    paddingVertical: 5,
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  listText: {
    flex: 1,
  },
  btnWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
  },
});
