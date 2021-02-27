import React, { useContext, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import Button from '../../../components/button';

export default memo(observer(({ text, value, onPress, noBorder, line, sub }) => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  return (
    <Button
      mode='android'
      style={[styles.itemWrap, line ? styles.line : undefined]}
      androidColor={backgroundColor}
      onPress={onPress}
    >
      <>
        {line || noBorder ? null : <View style={styles.border}></View>}
        <View style={[styles.box, sub ? styles.hasSubBox : undefined]}>
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
        {sub ? (
          <View>
            <Text style={[styles.itemSub, { fontSize: fontSize * .9 }]}>{sub}</Text>
          </View>) : null
        }
      </>
    </Button>
  );
}));

const styles = StyleSheet.create({
  itemWrap: {
    backgroundColor: '#fff',
  },
  line: {
    marginTop: 24,
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
  hasSubBox: {
    height: 'auto',
    paddingTop: 10,
    paddingBottom: 6,
    minHeight: 40,
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
  itemSub: {
    paddingBottom: 10,
    paddingHorizontal: 15,
    color: '#888'
  },
});
