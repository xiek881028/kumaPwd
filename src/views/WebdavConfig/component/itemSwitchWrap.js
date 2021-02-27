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

export default memo(observer(({ title, sub, onValueChange, value, noSwitch, style: pStyle, disabled }) => {
  const { fontSize, backgroundColor, backgroundDisabled } = useContext(CTX_THEME);
  return (
    <View style={[styles.itemWrap, disabled ? styles.disabledWrap : '', pStyle]}>
      <View style={[styles.box, sub ? styles.hasSubBox : undefined]}>
        <Text
          style={[styles.item, disabled ? styles.disabledText : '', { fontSize }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {noSwitch ? null :
          <Switch
            style={styles.switch}
            thumbColor={disabled ? '#c1c1c1' : backgroundColor}
            trackColor={{ false: disabled ? '#e8e8e8' : backgroundDisabled, true: disabled ? '#e8e8e8' : Color(backgroundColor).darken(.2).hex() }}
            value={value}
            disabled={disabled}
            onValueChange={onValueChange}
          />
        }
      </View>
      {sub ? (
        <View>
          <Text style={[styles.itemSub, disabled ? styles.disabledText : '', { fontSize: fontSize * .9 }]}>{sub}</Text>
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
  disabledWrap: {
    backgroundColor: '#fbfbfb',
  },
  disabledText: {
    color: '#c1c1c1',
  },
});
