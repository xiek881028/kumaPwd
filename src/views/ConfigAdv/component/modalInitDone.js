import React, { useContext, forwardRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { observer } from 'mobx-react';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';
import style from '../../../css/common.js';

export default memo(observer(forwardRef(({ visible, onClose }, ref) => {
  const { fontSize } = useContext(CTX_THEME);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => (onClose ?? (() => { }))()}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>应用初始化成功</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[{ fontSize }]}>点击任何位置关闭应用后，请重新启动。</Text>
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => (onClose ?? (() => { }))()}
          >
            <Text
              style={[style.modalFooterBtn, style.btnSubColor, { fontSize }]}
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
});
