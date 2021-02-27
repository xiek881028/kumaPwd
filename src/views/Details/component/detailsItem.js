import React, { memo, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { observer } from 'mobx-react';
import Clipboard from '@react-native-community/clipboard';
import Button from '../../../components/button';

export default memo(observer(props => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const { setTipsFn } = useContext(CTX_TIPS);
  return props.data.value ? (
    <>
      <View style={styles.detailsBorder}></View>
      <Button
        mode='android'
        androidColor={backgroundColor}
        underlayColor={backgroundColor}
        onPress={() => {
          // props.copyStr(props.data.value, `${props.data.key}复制成功`);
          Clipboard.setString(props.data.value);
          setTipsFn('text', `${props.data.key}复制成功`);
        }}
      >
        <View
          style={styles.tipsLine}
        >
          <View style={styles.LineHead}>
            <Text style={[styles.tipsLineLabel, { fontSize }]}>{props.data.key}：</Text>
            <Text
              style={[styles.copy, { fontSize: fontSize * .9 }]}
            >
              点我复制{props.data.key}
            </Text>
          </View>
          <Text style={[styles.tipsLineVal, { fontSize: fontSize * 1.2 }]}>{props.data.value}</Text>
        </View>
      </Button>
    </>
  ) : null;
}));

const styles = StyleSheet.create({
  tipsLine: {
    // flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tipsLineLabel: {
    color: '#353535',
    paddingRight: 5,
  },
  tipsLineVal: {
    color: '#888',
    flex: 1,
  },
  LineHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  copy: {
    color: '#586C94',
  },
  detailsBorder: {
    borderTopWidth: 1.5,
    borderTopColor: '#eee',
    marginHorizontal: 20,
  },
});
