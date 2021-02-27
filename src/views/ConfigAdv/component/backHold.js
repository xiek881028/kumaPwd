import React, { useState, useEffect, memo } from 'react';
import {
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import {
  getBackHoldFlag,
  getBackHoldTime,
  mathLockTime,
  setStorage,
} from '../../../helper';
import { holdTimeList } from '../../../config';
import BackHoldAndroid from '../../../NativeModules/BackHoldAndroid';
import ItemSwitchWrap from './itemSwitchWrap';
import ItemTextWrap from './itemTextWrap';
import ModalList from './modalList';

export default memo(observer(props => {
  const [flag, setFlag] = useState(null);
  const [time, setTime] = useState(10);
  const [modalFlag, setModalFlag] = useState(false);
  useEffect(() => {
    (async () => {
      const _flag = await getBackHoldFlag();
      const _time = await getBackHoldTime();
      setFlag(_flag);
      setTime(_time);
    })();
  }, []);
  return flag === null ? null : (
    <>
      <ItemSwitchWrap
        title='后台留存'
        sub='应用在后台保留的时间。出于安全考虑不建议保留太长。'
        onValueChange={async val => {
          await setStorage('backHoldFlag', val);
          BackHoldAndroid.setBackHoldTime(val ? +time : 10);
          setFlag(val);
        }}
        value={flag}
      />
      {flag ? (
        <>
          <ItemTextWrap
            text='台留存时间'
            value={mathLockTime(time)}
            onPress={() => {
              setModalFlag(true);
            }}
          />
          <ModalList
            visible={modalFlag}
            time={time}
            list={holdTimeList}
            onClose={async val => {
              if (val !== undefined) {
                await setStorage('backHoldTime', val);
                BackHoldAndroid.setBackHoldTime(val);
                setTime(val);
              }
              setModalFlag(false);
            }}
          />
        </>
      ) : null}
    </>
  );
}));

const styles = StyleSheet.create({
});
