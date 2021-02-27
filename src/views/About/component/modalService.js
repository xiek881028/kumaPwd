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
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false);
      }}
    >
      <View style={style.modalBox}>
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>免责声明</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[styles.modalText, { fontSize }]}>在使用《{appName}》前，请您务必仔细阅读并透彻理解本声明。您可以选择不使用《{appName}》，但如果您使用《{appName}》，您的使用行为将被视为对本声明全部内容的认可。</Text>
          <Text style={[styles.modalText, { fontSize }]}>您拥有《{appName}》的免费使用权。但不得对《{appName}》软件进行反向工程、反向汇编、反向编译。</Text>
          <Text style={[styles.modalText, { fontSize }]}>您应该对使用《{appName}》的结果自行承担风险。《{appName}》是作者学习制作的软件。由于作者技术水平有限，并且软件技术更新速度快，《{appName}》无法保证是完全安全的。在使用过程中发生的任何意外或损失，作者概不负责。但作者会努力采取积极的措施保护您帐号、密码的安全。</Text>
          <Text style={[styles.modalText, { fontSize }]}>本声明未涉及的问题请参见国家有关法律法规，当本声明与国家有关法律法规冲突时，以国家法律法规为准。</Text>
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
              style={[style.btnSubColor, style.modalFooterBtn, { fontSize: fontSize }]}
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
