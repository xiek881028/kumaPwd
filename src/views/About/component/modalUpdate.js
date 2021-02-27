import React, { useContext, forwardRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import Button from '../../../components/button';
import { observer } from 'mobx-react';
import ModalBase from '../../../components/modalBase';
import { changeList } from '../../../config';
import style from '../../../css/common.js';

export default memo(observer(forwardRef(({ visible, onClose }, ref) => {
  console.log(`~~~更新弹窗 渲染~~~`);
  const { fontSize } = useContext(CTX_THEME);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false);
      }}
    >
      <View style={style.modalBox}>
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>更新说明</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          {changeList.map((item, index) => {
            const _item = typeof item === 'string' ? { text: item } : item;
            return (
              <View style={[styles.modalTextWrap]} key={index}>
                <Text style={[{ fontSize }]}>{`${index + 1}、`}</Text>
                <Text style={[styles.modalText, _item.mode === 'warning' ? style.warningColor : '', { fontSize }]}>{_item.text}</Text>
              </View>
            );
          })}
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            androidColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              (onClose ?? (() => { }))(false);
            }}
          >
            <Text
              style={[style.btnSubColor, style.modalFooterBtn, { fontSize }]}
            >关闭</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});

const styles = StyleSheet.create({
  modalTextWrap: {
    paddingVertical: 5,
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  modalText: {
    flex: 1,
  },
});
