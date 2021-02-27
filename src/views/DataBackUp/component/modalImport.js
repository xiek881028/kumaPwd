import React, { useContext, useState, forwardRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';
import FilesAndroid from '../../../NativeModules/FilesAndroid';
import style from '../../../css/common.js';
import { checkFile } from '../../../helper';

export default memo(observer(forwardRef(({ visible, onClose, info }, ref) => {
  console.log(`~~~导入操作弹窗 渲染~~~`);
  const navigation = useNavigation();
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const { setTipsFn } = useContext(CTX_TIPS);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false, {});
      }}
    >
      <View
        style={style.modalBox}
      >
        <Text
          style={[style.modalTitle, styles.modalTitle, { fontSize: fontSize * 1.1 }]}
        >{info.name}</Text>
        <ScrollView>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[styles.modalBtnBox]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              checkFile(info.path)
                .then(() => {
                  FilesAndroid.readFile(info.path, d => {
                    navigation.navigate('ImportCheck', { mode: 'cover', data: d.data });
                    (onClose ?? (() => { }))(false, {});
                  });
                })
                .catch(err => {
                  (onClose ?? (() => { }))(false, {});
                  setTipsFn('text', err);
                });
            }}
          >
            <Text
              style={[styles.modalBtnText, style.btnSubColor, { fontSize: fontSize * .9 }]}
            >全部导入</Text>
          </Button>
          {/* 下个版本删除 ~~~~~~~~ */}
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[styles.modalBtnBox]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              checkFile(info.path)
                .then(() => {
                  FilesAndroid.readFile(info.path, d => {
                    navigation.navigate('ImportCheck', { mode: 'cover', data: d.data, old: true });
                    (onClose ?? (() => { }))(false, {});
                  });
                })
                .catch(err => {
                  (onClose ?? (() => { }))(false, {});
                  setTipsFn('text', err);
                });
            }}
          >
            <Text
              style={[styles.modalBtnText, style.btnSubColor, { fontSize: fontSize * .9 }]}
            >全部导入（v1版数据）</Text>
          </Button>
          {/* 下个版本删除 ~~~~~~~~ */}
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[styles.modalBtnBox]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              checkFile(info.path)
                .then(() => {
                  FilesAndroid.readFile(info.path, d => {
                    navigation.navigate('ImportCheck', { mode: 'append', data: d.data });
                    (onClose ?? (() => { }))(false, {});
                  });
                })
                .catch(err => {
                  (onClose ?? (() => { }))(false, {});
                  setTipsFn('text', err);
                });
            }}
          >
            <Text
              style={[styles.modalBtnText, style.btnSubColor, { fontSize: fontSize * .9 }]}
            >仅导入缺失的账号</Text>
          </Button>
          {/* 下个版本删除 ~~~~~~~~ */}
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[styles.modalBtnBox]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              checkFile(info.path)
                .then(() => {
                  FilesAndroid.readFile(info.path, d => {
                    navigation.navigate('ImportCheck', { mode: 'append', data: d.data, old: true });
                    (onClose ?? (() => { }))(false, {});
                  });
                })
                .catch(err => {
                  (onClose ?? (() => { }))(false, {});
                  setTipsFn('text', err);
                });
            }}
          >
            <Text
              style={[styles.modalBtnText, style.btnSubColor, { fontSize: fontSize * .9 }]}
            >仅导入缺失的账号（v1版数据）</Text>
          </Button>
          {/* 下个版本删除 ~~~~~~~~ */}
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[styles.modalBtnBox]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              // checkFile(() => {
              //   this.refs.modal2.setModal(false);
              //   this.refs.modal4.setModal(true);
              // });
              (onClose ?? (() => { }))(false, { mode: 'rename' });
            }}
          >
            <Text
              style={[styles.modalBtnText, style.btnSubColor, { fontSize: fontSize * .9 }]}
            >重命名文件</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[styles.modalBtnBox]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              // checkFile(() => {
              //   ShareAndroid.shareFile(`发送备份文件`, info.path);
              //   this.refs.modal2.setModal(false);
              // });
              (onClose ?? (() => { }))(false, { mode: 'send' });
            }}
          >
            <Text
              style={[styles.modalBtnText, style.btnSubColor, { fontSize: fontSize * .9 }]}
            >发送文件</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[styles.modalBtnBox]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              // checkFile(() => {
              //   this.refs.modal2.setModal(false);
              //   this.refs.modal3.setModal(true);
              // });
              (onClose ?? (() => { }))(false, { mode: 'delete' });
            }}
          >
            <Text
              style={[styles.modalBtnText, style.btnSubColor, { fontSize: fontSize * .9 }]}
            >删除文件</Text>
          </Button>
        </ScrollView>
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});

const styles = StyleSheet.create({
  modalTitle: {
    paddingVertical: 15,
  },
  modalBtnBox: {
    justifyContent: 'center',
    // alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ebebeb',
  },
});
