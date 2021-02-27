import React, { useState, useEffect, memo } from 'react';
import {
  StyleSheet,
} from 'react-native';
import {
  getFingerprintFlag,
  setStorage,
} from '../../../helper';
import { observer } from 'mobx-react';
import ItemSwitchWrap from './itemSwitchWrap';
import fingerprintCls from '../../../helper/fingerprint';

export default memo(observer(props => {
  const [canUse, setCanUse] = useState(null);
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    (async () => {
      const _canUse = await fingerprintCls.canUse();
      const flag = await getFingerprintFlag();
      setCanUse(_canUse);
      setFlag(flag);
    })();
  }, []);
  return canUse ? (
    <ItemSwitchWrap
      title='指纹登录'
      sub=''
      value={flag}
      onValueChange={async val => {
        await setStorage('fingerprintFlag', val);
        setFlag(val);
      }}
    />
  ) : null;
}));

const styles = StyleSheet.create({
});
