import React, { useState, useContext, forwardRef, useRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { observer } from 'mobx-react';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';
import InputView from '../../../components/inputView';
import style from '../../../css/common.js';

export default memo(observer(forwardRef(({ visible, onClose }, ref) => {
  console.log(`~~~新建标签弹窗 渲染~~~`);
  const { fontSize, backgroundColor, fontDisabled, backgroundDisabled } = useContext(CTX_THEME);
  const [disabled, setDisabled] = useState(false);
  const text = useRef();
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => (onClose ?? (() => { }))({})}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>新建标签</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <InputView
            placeholder='点这里输入标签名称'
            onChangeText={val => {
              setDisabled(!!val == disabled);
              text.current = val;
            }}
            onSubmitEditing={() => (onClose ?? (() => { }))({ val: text.current })}
            maxLength={50}
            autoFocus={true}
            fontSize={fontSize}
          />
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => (onClose ?? (() => { }))({})}
          >
            <Text
              style={[style.modalFooterBtn, style.btnSubColor, { fontSize }]}
            >取消</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.modalFooterBtnbox, { backgroundColor: disabled ? backgroundDisabled : backgroundColor }]}
            underlayColor={backgroundColor}
            disabled={disabled}
            onPress={() => (onClose ?? (() => { }))({ val: text.current })}
          >
            <Text
              style={[style.modalFooterBtn, { fontSize: fontSize, color: disabled ? fontDisabled : style.btnColor.color }]}
            >确定</Text>
          </Button>
        </View>
      </View>
    </ModalBase >
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});
