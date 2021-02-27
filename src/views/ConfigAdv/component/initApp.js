import React, { useState, memo } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import ItemTextWrap from './itemTextWrap';
import ModalInitWarning from './modalInitWarning';
import ModalInitDone from './modalInitDone';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExitAndroid from '../../../NativeModules/ExitAndroid';

export default memo(observer(props => {
  const [modalWarningFlag, setModalWarningFlag] = useState(false);
  const [modalDoneFlag, setModalDoneFlag] = useState(false);
  return (
    <View style={[styles.wrap]}>
      <ItemTextWrap
        noBorder={true}
        text='应用初始化'
        onPress={() => {
          setModalWarningFlag(true);
        }}
      />
      <ModalInitWarning
        visible={modalWarningFlag}
        onClose={(sure) => {
          setModalWarningFlag(false);
          if (sure) {
            AsyncStorage.clear();
            setModalDoneFlag(true);
          }
        }}
      />
      <ModalInitDone
        visible={modalDoneFlag}
        onClose={() => {
          setModalDoneFlag(false);
          ExitAndroid.exit();
        }}
      />
    </View>
  );
}));

const styles = StyleSheet.create({
  wrap: {
    marginTop: 24,
  },
});
