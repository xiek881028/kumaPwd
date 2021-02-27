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
import FilesAndroid from '../../../NativeModules/FilesAndroid';
import style from '../../../css/common.js';
import { checkFile } from '../../../helper';

export default memo(observer(forwardRef(({ visible, onClose, info }, ref) => {
  console.log(`~~~删除文件弹窗 渲染~~~`);
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
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
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>删除文件</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[{ fontSize }]}>确定删除数据备份文件 “{info.name}” 吗？</Text>
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              (onClose ?? (() => { }))(false, {});
            }}
          >
            <Text
              style={[style.modalFooterBtn, style.btnSubColor, { fontSize }]}
            >取消</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.modalFooterBtnbox, { borderTopColor: backgroundColor, backgroundColor }]}
            underlayColor={backgroundColor}
            onPress={() => {
              checkFile(info.path)
                .then(res => {
                  FilesAndroid.delFile(info.path, d => {
                    (onClose ?? (() => { }))(false, { reload: true, pClose: true });
                    setTipsFn('text', '文件删除成功');
                  });
                })
                .catch(err => {
                  (onClose ?? (() => { }))(false, { pClose: true });
                  setTipsFn('text', err);
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
