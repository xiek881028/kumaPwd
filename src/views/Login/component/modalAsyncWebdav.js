import React, { useState, memo, useContext } from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';

//Css
import style from '../../../css/common.js';

export default memo(observer(({ visible, onClose }) => {
  console.log(`~~询问是否同步webdav弹窗执行~~`);
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <ModalBase
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false);
      }}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>提示</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[styles.modalText, { fontSize }]}>检测到您开启了WebDAV。修改密码会导致云端备份文件因为旧密码失效而无法解密。</Text>
          <Text style={[styles.modalText, { fontSize }]}>请确定您的数据已经妥善安置。</Text>
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              (onClose ?? (() => { }))(false);
            }}
          >
            <Text
              style={[style.btnSubColor, style.modalFooterBtn, { fontSize }]}
            >暂不修改</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.modalFooterBtnbox, { backgroundColor }]}
            underlayColor={backgroundColor}
            onPress={async () => {
              (onClose ?? (() => { }))(true);
            }}
          >
            <Text
              style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
            >继续</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
}), (prev, next) => {
  return prev.visible === next.visible;
});

const styles = StyleSheet.create({
  modalText: {},
});
