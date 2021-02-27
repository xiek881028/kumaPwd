import React, { memo, useContext } from 'react';
import {
  Text,
  View,
  ScrollView,
} from 'react-native';
import { observer } from 'mobx-react';
import style from '../../../css/common.js';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';

export default memo(observer(({ visible, onClose }) => {
  console.log(`~~自动备份弹窗 渲染函数执行~~`);
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <ModalBase
      visible={visible}
      onClose={() => (onClose ?? (() => { }))(false)}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>申请权限</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[{ fontSize }]}>自动备份功能已开启。</Text>
          <Text style={[{ fontSize }]}>该功能需要获取您设备的存储权限。请同意应用获取相关权限。</Text>
          <Text style={[{ fontSize }]}>点击取消或拒绝所需权限将会关闭自动备份功能。</Text>
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => (onClose ?? (() => { }))(false)}
          >
            <Text
              style={[style.btnSubColor, style.modalFooterBtn, { fontSize }]}
            >取消</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.modalFooterBtnbox, { backgroundColor }]}
            underlayColor={backgroundColor}
            onPress={async () => (onClose ?? (() => { }))(true)}
          >
            <Text
              style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
            >确定</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
}), (prev, next) => {
  return prev.visible === next.visible;
});
