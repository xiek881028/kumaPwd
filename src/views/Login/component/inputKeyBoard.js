import React, { useContext, memo, useRef } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../../components/button';

const EggImage = props => {
  const eggKey = useRef(Math.ceil(Math.random() * 5));
  let out = null;
  switch (eggKey.current) {
    case 1:
      out = (
        <Image
          source={require(`../../../images/keyboard-icon-1.png`)}
          style={styles.kumaIcon}
        />
      );
      break;
    case 2:
      out = (
        <Image
          source={require(`../../../images/keyboard-icon-2.png`)}
          style={styles.kumaIcon}
        />
      );
      break;
    case 3:
      out = (
        <Image
          source={require(`../../../images/keyboard-icon-3.png`)}
          style={styles.kumaIcon}
        />
      );
      break;
    case 4:
      out = (
        <Image
          source={require(`../../../images/keyboard-icon-4.png`)}
          style={styles.kumaIcon}
        />
      );
      break;
    case 5:
      out = (
        <Image
          source={require(`../../../images/keyboard-icon-5.png`)}
          style={styles.kumaIcon}
        />
      );
  }
  return out;
};

export default memo(observer(props => {
  console.log(`~~~键盘组件被渲染~~~`);
  const keyboardArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'];
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const { flag: eggFlag } = useContext(CTX_EGG);
  const getInput = index => {
    props.getKeybordVal(keyboardArr[index]);
  }
  let items = [];
  for (let i = 0, max = keyboardArr.length; i < max; i++) {
    items.push(
      keyboardArr[i] === '' ?
        <View key={i} style={styles.InputKeyboardItem}>
          {eggFlag ? <EggImage /> : null}
        </View>
        :
        <Button
          // mode='android'
          androidColor={backgroundColor}
          key={i}
          style={styles.InputKeyboardItem}
          underlayColor='rgba(0, 0, 0, .1)'
          onPress={getInput.bind(this, i)}
        >
          <Text style={[styles.InputKeyboardText, { fontSize: fontSize * 1.6 }]}>{
            keyboardArr[i] == 'del' ?
              <Feather name='delete' style={[styles.InputKeyboardText, { fontSize: fontSize * 1.6 }]} />
              : keyboardArr[i]
          }</Text>
        </Button>
    );
  }
  return (
    <View style={props.style}>
      <View style={[styles.InputKeyboardBox]}>
        {items}
      </View>
      <View style={styles.InputKeyboardBg}></View>
    </View>
  );
}));

const styles = StyleSheet.create({
  InputKeyboardBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    zIndex: 2,
    flex: 1,
  },
  InputKeyboardBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // flex: 1,
    backgroundColor: 'rgba(0, 0, 0, .05)',
  },
  InputKeyboardItem: {
    width: '33.33333333%',
    alignItems: 'center',
    justifyContent: 'center',
    height: '25%',
  },
  InputKeyboardText: {
    color: '#333',
    fontSize: 26,
    lineHeight: 50,
    marginVertical: 5,
  },
  kumaIcon: {
    resizeMode: 'contain',
    height: '60%',
  },
});
