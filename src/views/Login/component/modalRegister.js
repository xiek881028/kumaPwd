import React, { memo, forwardRef, useContext } from 'react';
import {
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
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false);
      }}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>提示</Text>
        <ScrollView style={[style.modalContent]}>
          <Text style={[{ fontSize }]}>如果您有{appName}的备份文件，设置密码后，在“设置 > 数据备份”进行导入。</Text>
          <Text style={[{ fontSize }]}>WebDAV只有在当前密码与备份时的密码一致时才能同步成功。</Text>
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.modalFooterBtnbox, { backgroundColor }]}
            underlayColor={backgroundColor}
            onPress={() => {
              (onClose ?? (() => { }))(false);
            }}
          >
            <Text
              style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
            >确定</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});
