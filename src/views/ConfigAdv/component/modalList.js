import React, { useContext, forwardRef, memo } from 'react';
import Feather from 'react-native-vector-icons/Feather';
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
import { mathLockTime } from '../../../helper';

export default memo(observer(forwardRef(({ visible, onClose, time, list, renderItem }, ref) => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => (onClose ?? (() => { }))()}
    >
      <View
        style={style.modalBox}
      >
        <ScrollView>
          {list.map((val, index) => {
            let isCheck = val == +time;
            return (
              <Button
                mode='android'
                androidColor={backgroundColor}
                key={index}
                onPress={() => (onClose ?? (() => { }))(val)}
              >
                <View style={styles.modalItemBox}>
                  <Feather
                    name={isCheck ? 'check-circle' : 'circle'}
                    size={20}
                    style={[styles.radioDefault, isCheck ? styles.radioCheck : '']}
                  />
                  <Text
                    style={[styles.radioText, { fontSize }]}
                    numberOfLines={1}
                  >
                    {renderItem ? renderItem(val) : mathLockTime(val)}
                  </Text>
                </View>
              </Button>
            );
          })}
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
              style={[style.btnSubColor, style.modalFooterBtn, { fontSize }]}
            >取消</Text>
          </Button>
        </View>
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible && prev.time === next.time;
});

const styles = StyleSheet.create({
  radioText: {
    color: '#353535',
  },
  modalItemBox: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
  },
  radioDefault: {
    color: '#999',
    paddingLeft: 15,
    paddingRight: 10,
  },
  radioCheck: {
    color: '#1AAD19',
  },
});
