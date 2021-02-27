import React, { useContext, useState, useEffect, forwardRef, memo } from 'react';
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

// 确定锁定倒计时
let timer = 5;
export default memo(observer(forwardRef(({ visible, onClose }, ref) => {
  const { fontSize, backgroundColor, backgroundDisabled, fontDisabled } = useContext(CTX_THEME);
  const [disabled, setDisabled] = useState(true);
  const [text, setText] = useState('');
  useEffect(() => {
    let countDown;
    if (visible) {
      timer = 5;
      const countDownFn = () => {
        setText(`${timer} s`);
        countDown = setTimeout(() => {
          if (timer <= 1) {
            clearTimeout(countDown);
            setText('确定');
            setDisabled(false);
            timer = 5;
          } else {
            timer -= 1;
            countDownFn();
          }
        }, 1000);
      };
      countDownFn();
    } else {
      setDisabled(true);
      clearTimeout(countDown);
    }
    return () => clearTimeout(countDown);
  }, [visible]);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => (onClose ?? (() => { }))()}
    >
      <View style={style.modalBox}>
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>应用初始化</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[style.warningColor, { fontSize }]}>应用初始化后，除了导出的备份文件会保留，其他数据将会全部清除且无法恢复。</Text>
          <Text style={[{ fontSize }]}>确定要将应用初始化吗？</Text>
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
            >取消</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.modalFooterBtnbox, { backgroundColor: disabled ? backgroundDisabled : backgroundColor }]}
            underlayColor={backgroundColor}
            disabled={disabled}
            onPress={() => (onClose ?? (() => { }))(true)}
          >
            <Text
              style={[style.modalFooterBtn, { fontSize: fontSize, color: disabled ? fontDisabled : style.btnColor.color }]}
            >{text}</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});
