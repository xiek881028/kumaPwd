import React, { useContext, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
} from 'react-native';
import Color from 'color';
import { observer } from 'mobx-react';
import style from '../../../css/common.js';

export default memo(observer(({ title, sub, onValueChange, value, noSwitch, style: pStyle }) => {
  const { fontSize, backgroundColor, backgroundDisabled } = useContext(CTX_THEME);
  return (
    <View style={[styles.itemWrap, pStyle]}>
      <View style={[styles.box, sub ? styles.hasSubBox : undefined]}>
        <Text
          style={[styles.item, { fontSize }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {noSwitch ? null :
          <Switch
            style={styles.switch}
            thumbColor={backgroundColor}
            trackColor={{ false: backgroundDisabled, true: Color(backgroundColor).darken(.2).hex() }}
            value={value}
            onValueChange={onValueChange}
          />
        }
      </View>
      {sub ? (
        <View>
          <Text style={[styles.itemSub, { fontSize: fontSize * .9 }]}>{sub}</Text>
        </View>) : null
      }
    </View>
  );
}));

const styles = StyleSheet.create({
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
  itemWrap: {
    marginTop: 24,
    backgroundColor: '#fff',
  },
  itemSub: {
    paddingBottom: 10,
    paddingHorizontal: 15,
    color: '#888',
  },
  item: {
    textAlignVertical: 'center',
    // borderWidth: 1,
    paddingHorizontal: 15,
    color: '#353535',
  },
  switch: {
    marginHorizontal: 10,
  },
});
