import React, { useContext, forwardRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { encrypt } from '../../../helper/crypto';
import { observer } from 'mobx-react';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';
import FilesAndroid from '../../../NativeModules/FilesAndroid';
import style from '../../../css/common.js';
import { getTimerFileName } from '../../../helper';

export default memo(observer(forwardRef(({ visible, onClose, paths }, ref) => {
  console.log(`~~~导出操作弹窗 渲染~~~`);
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const { cls } = useContext(CTX_LIST);
  const { pwd } = useContext(CTX_USER);
  const { setTipsFn } = useContext(CTX_TIPS);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false, {});
      }}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>导出数据</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[styles.warningText, { fontSize }]}>请牢记登录密码，否则导出的备份文件无法解密。</Text>
          <Text style={[{ fontSize }]}>确定导出数据吗？</Text>
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => (onClose ?? (() => { }))(false, {})}
          >
            <Text
              style={[style.modalFooterBtn, style.btnSubColor, { fontSize }]}
            >取消</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.modalFooterBtnbox, { backgroundColor }]}
            underlayColor={backgroundColor}
            onPress={async () => {
              await cls.cleanTag();
              const list = await cls.getOriginList();
              const tags = await cls.getOriginTag();
              const exportObj = {};
              exportObj.accountList = list;
              exportObj.tags = tags;
              FilesAndroid.writeFile(paths, `/${getTimerFileName()}.kuma`, encrypt(JSON.stringify(exportObj), pwd), true, d => {
                setTipsFn('text', `备份文件导出${d.flag ? '成功' : '失败'}`);
                (onClose ?? (() => { }))(false, { reload: d.flag });
              });
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

const styles = StyleSheet.create({
  modalTitle: {
    paddingVertical: 15,
  },
});
