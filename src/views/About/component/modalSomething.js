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
  console.log(`~~~碎碎念弹窗 渲染~~~`);
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
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>作者的碎碎念</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[styles.modalText, { fontSize }]}>《{appName}》是我的第一个APP作品。</Text>
          <Text style={[styles.modalText, { fontSize }]}>这个APP原本只是做给自己和身边的亲人用的，加上平时要上班，所以更新比较佛系。</Text>
          <Text style={[styles.modalText, { fontSize }]}>源码已经放在github上，网址为https://github.com/xiek881028/kumaPwd。</Text>
          <Text style={[styles.modalText, { fontSize }]}>由于是第一次开发APP，一定会有非常多欠考虑的地方，所以还请大家多多包涵。</Text>
          <Text style={[styles.modalText, { fontSize }]}>如果在使用过程中遇到什么问题，或是发现了bug，或者有什么改进的意见和建议，都可以给作者发邮件。</Text>
          <Text style={[styles.modalText, { fontSize }]}>邮箱： xk285985285@qq.com</Text>
          <Text style={[styles.modalText, { fontSize }]}>最后，希望您能喜欢《{appName}》。</Text>
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
