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
import FilesAndroid from '../../../NativeModules/FilesAndroid';
import style from '../../../css/common.js';
import { checkFile } from '../../../helper';

export default memo(observer(forwardRef(({ visible, onClose, info }, ref) => {
  console.log(`~~~重命名文件弹窗 渲染~~~`);
  const { fontSize, backgroundColor, fontDisabled, backgroundDisabled } = useContext(CTX_THEME);
  const { setTipsFn } = useContext(CTX_TIPS);
  const [disabled, setDisabled] = useState(false);
  const text = useRef();
  const submit = () => {
    checkFile(info.path)
      .then(res => {
        FilesAndroid.rename(info.path, `${info.parentPath}/${text.current ?? info.name}`, d => {
          let errMsg = '';
          /*
          code:
          00: 重命名文件成功
          01: 重命名文件失败
          02: 重命名文件已存在同名文件
           */
          switch (d.code) {
            case '00':
              errMsg = '重命名文件成功';
              break;
            case '01':
              errMsg = '重命名文件失败';
              break;
            case '02':
              errMsg = '文件名和已有文件重复';
              break;
          }
          errMsg && setTipsFn('text', errMsg);
          (onClose ?? (() => { }))(false, { pClose: true, reload: true });
        });
      })
      .catch(err => {
        (onClose ?? (() => { }))(false, { pClose: true });
        setTipsFn('text', err);
      });
  };
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
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>重命名文件</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <InputView
            placeholder='点这里输入文件名称'
            defaultValue={info.name}
            onChangeText={val => {
              setDisabled(!!val == disabled);
              text.current = val;
            }}
            onSubmitEditing={() => submit()}
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
            style={[style.modalFooterBtnbox, { backgroundColor: disabled ? backgroundDisabled : backgroundColor }]}
            underlayColor={backgroundColor}
            disabled={disabled}
            onPress={() => submit()}
          >
            <Text
              style={[style.modalFooterBtn, { fontSize: fontSize, color: disabled ? fontDisabled : style.btnColor.color }]}
            >确定</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});
