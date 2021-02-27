import React, { useEffect, useContext, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from './button';
import Color from 'color';

export default ({ activity: pActivity, onPress, children, mode, icon: Icon }) => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const [activity, setActivity] = useState(pActivity);
  // tag高度 = 行高 + 上下padding + 上下border + 上下margin
  return (
    <View
      style={[styles.wrap, mode === 'add' ? styles.addWrap : '', {
        borderColor: backgroundColor,
        backgroundColor: activity ? backgroundColor : '#fff',
        borderRadius: fontSize,
      }]}
    >
      <Button style={[styles.btn]}
        onPress={() => (onPress ?? (() => { }))(!activity, setActivity)}
        mode='android'
        androidColor={activity ? backgroundColor : Color(backgroundColor).lighten(.7).hex()}
      >
        <Text
          style={[{
            color: activity ? '#fff' : backgroundColor,
            fontSize,
            lineHeight: fontSize * 1.15,
            maxWidth: Icon ? '95%' : undefined,
          }]}
          numberOfLines={1}
        >
          {children}
        </Text>
        {Icon ? <Icon /> : null}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    marginHorizontal: 4,
    marginVertical: 5,
    overflow: 'hidden',
  },
  addWrap: {
    borderStyle: 'dashed',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
  },
});
