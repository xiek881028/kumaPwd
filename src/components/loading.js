import React, { useEffect, useState, memo, useContext, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { observer } from 'mobx-react';
import style from '../css/common.js';

export default memo(observer(props => {
  const { fontSize } = useContext(CTX_THEME);
  const { set, ops } = useContext(CTX_LOADING);
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    set?.show === true && Keyboard.dismiss();
    if (ops?.delay && set?.show) {
      timer.current = setTimeout(() => setShow(true), ops.delay);
    } else {
      setShow(set?.show);
    }
  }, [set, ops]);
  return show ? (
    <View
      style={[styles.loadingModalWrap]}
    >
      <View
        style={[styles.loadingModal]}
      >
        <View style={[styles.loadingTextWrap]}>
          <ActivityIndicator color='#fff' size='large' />
          {set?.text ? (
            <Text style={[styles.loadingModalText]}>{set?.text}</Text>
          ) : null}
        </View>
      </View>
    </View>
  ) : null;
}));

const styles = StyleSheet.create({
  loadingModalWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99998,
  },
  loadingModal: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(53, 53, 53, .8)',
    borderRadius: 8,
  },
  loadingTextWrap: {
    zIndex: 2,
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    // backgroundColor: '#c00',
  },
  loadingModalText: {
    marginTop: 16,
    marginHorizontal: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
