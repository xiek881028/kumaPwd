import React, { memo } from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';

export default memo(props => {
  let items = [];
  for (let i = 0, max = props.number; i < max; i++) {
    items.push(
      <View key={i} style={[styles.inputPwdItem, i == max - 1 ? styles.inputPwdItemLast : '']}>
        <Text style={props.pwd[i] != undefined ? styles.inputPwdItemText : ''}></Text>
      </View>
    );
  }
  return (
    <View style={[styles.inputPwdBox, props.style]}>
      {items}
    </View>
  );
});

const styles = StyleSheet.create({
  //InputPwd
  inputPwdBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#333',
  },
  inputPwdItem: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPwdItemLast: {
    borderRightWidth: 2,
    borderRightColor: '#333',
  },
  inputPwdItemText: {
    width: 15,
    height: 15,
    borderRadius: 15,
    backgroundColor: '#333',
  },
});
