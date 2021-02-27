import React from 'react';
import {
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import Color from 'color';
export default ({ children, androidColor, style, borderless, rippleRadius, mode, ...other }) => {
  // 安卓下使用安卓自带点击涟漪效果，获得更好的用户体验
  return OS === 'android' && mode === 'android' ?
    <TouchableNativeFeedback
      {...other}
      background={TouchableNativeFeedback.Ripple(Color(androidColor).darken(.2).hex(), borderless, rippleRadius)}
      useForeground={false}
    >
      <View style={style}>
        {children}
      </View>
    </TouchableNativeFeedback>
    :
    <TouchableHighlight
      style={style}
      {...other}
    >
      {children}
    </TouchableHighlight>;
};
