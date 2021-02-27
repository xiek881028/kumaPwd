import React, { useContext, forwardRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { observer } from 'mobx-react';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';
//Css
import style from '../../../css/common.js';

export default memo(observer(forwardRef(({ visible, onClose }, ref) => {
  console.log(`~~~彩蛋弹窗 渲染~~~`);
  const { fontSize } = useContext(CTX_THEME);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false);
      }}
    >
    <View style={styles.eggPhotoBox}>
      <Image
        source={require('../../../images/egg.jpg')}
        resizeMode='cover'
        style={styles.eggPhoto}
      ></Image>
    </View>
    <Button
      onPress={() => {
        (onClose ?? (() => { }))(false);
      }}
      mode='android'
      androidColor={style.btnSubHeightBg.backgroundColor}
      style={[styles.btnBox, style.btnSubBg]}
    >
      <Text style={[styles.btn, style.btnSubColor, { fontSize: fontSize * 1.125 }]}>关闭</Text>
    </Button>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});

const styles = StyleSheet.create({
  btnBox: {
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
  },
  btn: {
    lineHeight: 36,
  },
  eggPhotoBox: {
    marginBottom: 15,
  },
  eggPhoto: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 3,
    overlayColor: 'rgba(0, 0, 0, 0)',
  },
});
