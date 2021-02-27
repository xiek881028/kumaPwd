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

export default memo(observer(({ visible, onClose, onOk }) => {
  console.log(`~~首页上传同步弹窗 渲染函数执行~~`);
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <ModalBase
      visible={visible}
      onClose={() => (onClose ?? (() => { }))(false)}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>提示</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[style.warningColor, { fontSize }]}>如果有误删的数据，备份会导致这些数据无法再找回！</Text>
          <Text style={[{ fontSize }]}>确定用本地数据覆盖云端数据吗？</Text>
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
            onPress={async () => (onOk ?? (() => { }))(true)}
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
  return prev.visible === next.visible && prev.onOk === next.onOk;
});
