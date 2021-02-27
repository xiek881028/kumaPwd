import React, { useState, useEffect, memo } from 'react';
import {
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import {
  getAutoBackupFlag,
  setStorage,
  delStorage,
} from '../../../helper';
import ItemSwitchWrap from './itemSwitchWrap';

export default memo(observer(props => {
  const [flag, setFlag] = useState(null);
  useEffect(() => {
    (async () => {
      const _flag = await getAutoBackupFlag();
      setFlag(_flag);
    })();
  }, []);
  return flag === null ? null : (
    <ItemSwitchWrap
      title='自动备份'
      sub='自动备份会在每天第一次成功登录应用后进行。'
      onValueChange={async val => {
        await setStorage('autoBackupFlag', val);
        await delStorage('todayIsSave');
        setFlag(val);
      }}
      value={flag}
    />
  );
}));

const styles = StyleSheet.create({
});
