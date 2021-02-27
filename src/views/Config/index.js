import React, { useState, useContext } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
} from 'react-native';
import { shareLink } from '../../config';

import ShareAndroid from '../../NativeModules/ShareAndroid';
import BasePage from '../../components/basePage';
import Button from '../../components/button';
import ModalAliPay from './component/modalAliPay';
import { observer } from 'mobx-react';

export default observer(props => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const [modalFlag, setModalFlag] = useState(false);
  const sections = [
    {
      data: [
        { name: '设置字体大小', href: 'ConfigEditFont', icon: <Feather name="bold" size={fontSize * 1.25} color='#1abc9c' /> },
        { name: '设置主题色', href: 'ConfigColor', icon: <Feather name="feather" size={fontSize * 1.25} color='#2ecc71' /> },
      ]
    },
    {
      data: [
        { name: '修改密码', href: 'EditPwd', icon: <Feather name="lock" size={fontSize * 1.25} color='#308fdf' /> },
      ]
    },
    {
      data: [
        { name: '本地备份', href: 'DataBackUp', icon: <Feather name="save" size={fontSize * 1.25} color='#9b59b6' /> },
        { name: 'WebDAV', href: 'WebdavConfig', icon: <Feather name="globe" size={fontSize * 1.25} color='#c7b198' /> },
      ]
    },
    {
      data: [
        { name: '高级设置', href: 'ConfigAdv', icon: <Feather name="settings" size={fontSize * 1.25} color='#f1c40f' /> },
      ]
    },
    {
      data: [
        { name: '关于', href: 'About', icon: <Feather name="smile" size={fontSize * 1.25} color='#ff7e16' /> },
        {
          name: '分享', fn: () => {
            if (OS == 'android') {
              ShareAndroid.shareText('分享应用', `账号匣，简单、安全、好用的账号记录工具\n${shareLink}`);
            }
          }, icon: <Feather name="share-2" size={fontSize * 1.25} color='#ff5053' />
        },
      ]
    },
    {
      data: [
        {
          name: '投喂', fn: () => {
            if (OS == 'android') {
              setModalFlag(true);
            }
          }, icon: <Feather name="gift" size={fontSize * 1.25} color='#ff8585' />
        },
      ]
    },
  ];
  return (
    <BasePage>
      <View style={styles.pageWrap}>
        <SectionList
          sections={sections}
          // keyboardDismissMode='on-drag'
          // keyboardShouldPersistTaps='handled'
          renderItem={({ item, index }) => {
            return (
              <Button
                mode='android'
                onPress={() => {
                  if (item.fn) {
                    item.fn();
                  } else {
                    props.navigation.navigate(item.href, item.data ? { ...item.data } : {});
                  }
                }}
                underlayColor='#d9d9d9'
                androidColor={backgroundColor}
                style={styles.wrap}
              >
                {item.icon}
                <Text
                  style={[styles.item, { fontSize }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </Button>
            )
          }}
          renderSectionHeader={({ section }) => {
            return (
              <View style={styles.headBox}></View>
            )
          }
          }
          initialNumToRender={50}
          ItemSeparatorComponent={() => <View style={styles.borderWrap}><View style={styles.border}></View></View>}
          keyExtractor={(item, index) => {
            return index.toString();
          }}
          getItemLayout={(data, index) => {
            return ({
              length: 50,
              offset: (60 + 1) * index,
              index,
            });
          }}
          ListFooterComponent={() => {
            // 给与底部一些空间，避免选项贴低，显示效果较差
            return (
              <View
                style={styles.bottomPad}
              ></View>
            );
          }}
        ></SectionList>
      </View>
      <ModalAliPay visible={modalFlag} onClose={flag => {
        setModalFlag(flag);
      }} />
    </BasePage>
  );
});

const styles = StyleSheet.create({
  pageWrap: {
    backgroundColor: '#ebebeb',
    flex: 1,
  },
  wrap: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    height: 60,
  },
  headBox: {
    marginTop: 24,
  },
  item: {
    textAlignVertical: 'center',
    // borderWidth: 1,
    paddingLeft: 8,
    color: '#353535',
  },
  bottomPad: {
    height: 28,
  },
  borderWrap: {
    height: 1,
    backgroundColor: '#fff',
  },
  border: {
    marginHorizontal: 16,
    flex: 2,
    backgroundColor: '#efefef',
  },
});
