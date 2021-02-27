import React, { useContext, forwardRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  PermissionsAndroid,
} from 'react-native';
import { observer } from 'mobx-react';
import ModalBase from './modalBase';
import Button from './button';
import { checkAndRequestPermissionAndroid } from '../helper';

//Css
import style from '../css/common.js';

export default memo(observer(forwardRef(({ visible, onClose, text }, ref) => {
  console.log(`~~~权限弹窗 渲染~~~`);
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false, { permission: null });
      }}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>申请权限</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[styles.modalText, { fontSize }]}>{text}</Text>
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            androidColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              (onClose ?? (() => { }))(false, { permission: null });
            }}
          >
            <Text
              style={[style.btnSubColor, style.modalFooterBtn, { fontSize }]}
            >取消</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.modalFooterBtnbox, { backgroundColor }]}
            onPress={async () => {
              const permission = await checkAndRequestPermissionAndroid([
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              ]);
              (onClose ?? (() => { }))(false, { permission });
            }}
          >
            <Text
              style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
            >确定</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});

const styles = StyleSheet.create({
  modalText: {
    paddingVertical: 5,
  },
});
