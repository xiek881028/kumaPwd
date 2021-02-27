import React, { useState, useEffect, memo, useContext } from 'react';
import {
  StyleSheet,
} from 'react-native';
import {
  setStorage,
} from '../../../helper';
import { observer } from 'mobx-react';
import ItemSwitchWrap from './itemSwitchWrap';

export default memo(observer(props => {
  const { flag: eggFlag, setEggFn } = useContext(CTX_EGG);
  useEffect(() => {
    (async () => {
      setEggFn(eggFlag);
    })();
  }, []);
  return (
    <ItemSwitchWrap
      title='展示彩蛋'
      sub=''
      value={eggFlag}
      onValueChange={async val => {
        await setStorage('egg', val);
        setEggFn('flag', val);
      }}
    />
  );
}));

const styles = StyleSheet.create({
});
