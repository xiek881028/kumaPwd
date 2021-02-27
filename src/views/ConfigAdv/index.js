import React, { useContext } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import BasePage from '../../components/basePage';
import AutoBackup from './component/autoBackup';
import BackHold from './component/backHold';
import PwdLock from './component/pwdLock';
import InitApp from './component/initApp';
import Fingerprint from './component/fingerprint';
import Egg from './component/egg';

export default observer(props => {
  const { done: eggDone } = useContext(CTX_EGG);
  return (
    <BasePage>
      <ScrollView contentContainerStyle={[styles.scrollWrap]}>
        <Fingerprint />
        <AutoBackup />
        <BackHold />
        <PwdLock />
        {eggDone ? <Egg /> : null}
        <InitApp />
      </ScrollView>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  scrollWrap: {
    paddingBottom: 30,
  },
});
