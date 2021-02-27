import React, { useContext, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import Button from '../../../components/button';

export default memo(observer(({ text, value, onPress, noBorder }) => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <Button
      mode='android'
      style={[styles.itemWrap]}
      androidColor={backgroundColor}
      onPress={onPress}
    >
      <>
        {noBorder ? null : <View style={styles.border}></View>}
        <View style={[styles.box]}>
          <Text
            style={[styles.item, { fontSize }]}
            numberOfLines={1}
          >
            {text}
          </Text>
          <Text
            style={[styles.item, styles.itemRight, { fontSize }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      </>
    </Button>
  );
}));

const styles = StyleSheet.create({
  itemWrap: {
    backgroundColor: '#fff',
  },
  border: {
    marginHorizontal: 10,
    height: 1,
    backgroundColor: '#eee',
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  item: {
    textAlignVertical: 'center',
    // borderWidth: 1,
    paddingHorizontal: 15,
    color: '#353535',
  },
  itemRight: {
    color: '#999',
  },
});
