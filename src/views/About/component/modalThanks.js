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
import { appName } from '../../../config';

//Css
import style from '../../../css/common.js';

export default memo(observer(forwardRef(({ visible, onClose }, ref) => {
  console.log(`~~~感谢弹窗 渲染~~~`);
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
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>感谢</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[styles.modalText, { fontSize }]}>首先，感谢打开《{appName}》的您。</Text>
          <Text style={[styles.modalText, { fontSize }]}>感谢 chenxx 支持了巨额（5元）研发资金~</Text>
          <Text style={[styles.modalText, { fontSize }]}>感谢 谢武龙 在技术方面提供的帮助。</Text>
          <Text style={[styles.modalText, { fontSize }]}>感谢 Skeleton 在UI风格、产品逻辑、文案润色方面提供的帮助。</Text>
          <Text style={[styles.modalText, { fontSize }]}>感谢 Hyde 在产品逻辑方面提供的帮助。</Text>
          <Text style={[styles.modalText, { fontSize }]}>感谢 父母 做为产品体验师提出的宝贵意见。</Text>
          <Text style={[styles.modalText, { fontSize }]}>感谢 《账号本子》 给了本作品诸多灵感。</Text>
          <Text style={[styles.modalText, { fontSize }]}>感谢 react-native、mobx、WeUI、crypto-js等众多开源技术。</Text>
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
  modalText: {
    paddingVertical: 5,
  },
});
