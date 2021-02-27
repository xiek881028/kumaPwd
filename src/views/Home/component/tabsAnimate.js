import React, { memo, useContext, useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { observer } from 'mobx-react';
import style from '../../../css/common.js';
import Button from '../../../components/button';

export default memo(observer(({ active, onPress, data }) => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  // 屏幕宽度 - modal的margin * 2 - context的margin * 2
  const width = Dimensions.get('window').width - 10 * 2 - 20 * 2;
  const animateWidth = useRef(new Animated.Value(0));
  const move = active => {
    Animated.timing(animateWidth.current, {
      toValue: active ? width / 2 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  useEffect(() => {
    move(active);
  }, [active]);
  return (
    <View style={[styles.typeWrap]}>
      <View style={[styles.borderWrap]}>
        <Animated.View style={[styles.borderBlock, { backgroundColor, width: animateWidth.current }]}></Animated.View>
      </View>
      <Button
        mode='android'
        androidColor={style.btnSubHeightBg.backgroundColor}
        style={[styles.tapType]}
        underlayColor={style.btnSubHeightBg.backgroundColor}
        onPress={() => (onPress ?? (() => { }))()}
      >
        <Text style={[styles.typeTitle, { fontSize: fontSize * 1, color: active ? backgroundColor : '#808186' }]}>
          {data.name}
        </Text>
        {data.len > 0 ? (
          <Text style={[styles.sub, { fontSize: fontSize * .66, backgroundColor: style.warningColor.color }]}>{data.len}</Text>
        ) : null}
      </Button>
    </View>
  );
}));

const styles = StyleSheet.create({
  typeWrap: {
    width: '50%',
    borderBottomWidth: 2,
    borderColor: '#e5e4e4',
  },
  borderWrap: {
    position: 'absolute',
    height: 3,
    width: '100%',
    bottom: -2,
    alignItems: 'center',
  },
  borderBlock: {
    flex: 1,
  },
  tapType: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitle: {
    textAlign: 'center',
  },
  sub: {
    textAlign: 'center',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
});
