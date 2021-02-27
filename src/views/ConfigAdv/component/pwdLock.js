import React, { useState, useEffect, memo } from 'react';
import {
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import {
  getErrorLockFlag,
  getPwdTryMaxTimer,
  getErrorPwdTime,
  mathLockTime,
  setStorage,
} from '../../../helper';
import { lockTimeList, lockNumList } from '../../../config';
import ItemSwitchWrap from './itemSwitchWrap';
import ItemTextWrap from './itemTextWrap';
import ModalList from './modalList';

export default memo(observer(props => {
  const [flag, setFlag] = useState(null);
  const [num, setNum] = useState('');
  const [time, setTime] = useState('');
  const [modalTimeFlag, setModalTimeFlag] = useState(false);
  const [modalNumFlag, setModalNumFlag] = useState(false);
  useEffect(() => {
    (async () => {
      const _flag = await getErrorLockFlag();
      const _time = await getErrorPwdTime();
      const _num = await getPwdTryMaxTimer();
      setFlag(_flag);
      setTime(_time);
      setNum(_num);
    })();
  }, []);
  return flag === null ? null : (
    <>
      <ItemSwitchWrap
        title='密码锁定'
        sub='当密码连续输错时，锁定应用。出于安全考虑建议开启。'
        onValueChange={async val => {
          await setStorage('errorPwdFlag', val);
          setFlag(val);
        }}
        value={flag}
      />
      {flag ? (
        <>
          <ItemTextWrap
            text='试错次数'
            value={`${num}次`}
            onPress={() => {
              setModalNumFlag(true);
            }}
          />
          <ModalList
            visible={modalNumFlag}
            time={num}
            list={lockNumList}
            renderItem={val => `${val}次`}
            onClose={async val => {
              if (val !== undefined) {
                await setStorage('errorPwdNum', val);
                setNum(val);
              }
              setModalNumFlag(false);
            }}
          />
          <ItemTextWrap
            text='锁定时长'
            value={mathLockTime(time)}
            onPress={() => {
              setModalTimeFlag(true);
            }}
          />
          <ModalList
            visible={modalTimeFlag}
            time={time}
            list={lockTimeList}
            onClose={async val => {
              if (val !== undefined) {
                await setStorage('errorPwdTime', val);
                setTime(val);
              }
              setModalTimeFlag(false);
            }}
          />
        </>
      ) : null}
    </>
  );
}));

const styles = StyleSheet.create({
});
