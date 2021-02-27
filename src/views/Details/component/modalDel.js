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
import style from '../../../css/common.js';

export default memo(observer(forwardRef(({ visible, onClose, data }, ref) => {
  console.log(`~~~删除账号弹窗 渲染~~~`);
  const { fontSize } = useContext(CTX_THEME);
  const { cls, setListFn } = useContext(CTX_LIST);
  const { setTipsFn } = useContext(CTX_TIPS);
  const pruneStr = (str, length) => {
    if (str.length <= length) {
      return str;
    } else {
      return `${str.substr(0, length)}...`;
    }
  };
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))({ goBack: false });
      }}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>删除账号</Text>
        <ScrollView contentContainerStyle={[style.modalContent]}>
          <Text style={[{ fontSize }]}>{`账号删除后将无法找回，确定要删除“${pruneStr(data.name ?? '', 10)}”吗？`}</Text>
        </ScrollView>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            style={[style.modalFooterBtnbox, style.btnSubBg, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => {
              (onClose ?? (() => { }))({ goBack: false });
            }}
          >
            <Text
              style={[style.modalFooterBtn, style.btnSubColor, { fontSize }]}
            >取消</Text>
          </Button>
          <Button
            mode='android'
            androidColor='#CE3C39'
            style={[style.modalFooterBtnbox, styles.delFooterBtnRightbox]}
            underlayColor='#CE3C39'
            onPress={async () => {
              await cls.del(data.id);
              setListFn(cls.viewList);
              setTipsFn('text', '删除成功');
              (onClose ?? (() => { }))({ goBack: true });
            }}
          >
            <Text
              style={[style.modalFooterBtn, styles.delFooterBtnRight, { fontSize }]}
            >删除</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});

const styles = StyleSheet.create({
  delFooterBtnRightbox: {
    backgroundColor: '#E64340',
    borderTopColor: '#CE3C39',
  },
  delFooterBtnRight: {
    color: '#fff',
  },
});
