import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { observer } from 'mobx-react';
import BasePage from '../../components/basePage';
import ModalThanks from './component/modalThanks';
import ModalUpdate from './component/modalUpdate';
import ModalSomething from './component/modalSomething';
import ModalService from './component/modalService';
import ModalEgg from './component/modalEgg';
import Button from '../../components/button';
import { appName, version } from '../../config';
//Css
import style from '../../css/common.js';

let eggIndex = 0;
const eggMax = 10;
export default observer(props => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const { setTipsFn } = useContext(CTX_TIPS);
  const { flag: eggFlag } = useContext(CTX_EGG);
  const [modalThanks, setModalThanks] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalSomething, setModalSomething] = useState(false);
  const [modalService, setModalService] = useState(false);
  const [modalEgg, setModalEgg] = useState(false);
  const eggRandomFlag = useRef(!!Math.round(Math.random()));
  const egg = () => {
    eggIndex += 1;
    if (eggIndex >= 5 && eggIndex < eggMax) {
      setTipsFn('text', `离彩蛋还有${eggMax - eggIndex}下`);
      setTipsFn('isShow', true);
      setTipsFn('cb', () => {
        eggIndex = 0;
      });
    } else if (eggIndex >= eggMax) {
      setTipsFn('isShow', false);
      setTipsFn('text', '');
      eggIndex = 0;
      setModalEgg(true);
    }
  };
  useEffect(() => {
    return () => {
      eggIndex = 0;
    };
  }, []);
  return (
    <BasePage>
      <View
        style={[style.container, styles.aboutBox]}
      >
        <ScrollView>
          <View style={styles.iconBox}>
            <TouchableWithoutFeedback
              onPress={() => {
                egg();
              }}
            >
              <Image
                source={require('../../images/icon.png')}
                style={styles.kumaIcon}
              />
            </TouchableWithoutFeedback>
            <Text
              style={[styles.appName, { fontSize: fontSize * 1.2 }]}
            >{appName}</Text>
            <Text
              style={[styles.version, { fontSize: fontSize * .9 }]}
            >{version}</Text>
          </View>
          <View style={styles.listBox}>
            <Button
              mode='android'
              style={styles.listLine}
              androidColor={backgroundColor}
              onPress={() => {
                setModalService(true);
              }}
            >
              <Text style={[styles.listLineText, { fontSize }]}>免责声明</Text>
            </Button>
            <View style={styles.border}></View>
            <Button
              mode='android'
              style={styles.listLine}
              androidColor={backgroundColor}
              onPress={() => {
                setModalSomething(true);
              }}
            >
              <Text style={[styles.listLineText, { fontSize }]}>作者的碎碎念</Text>
            </Button>
            <View style={styles.border}></View>
            <Button
              mode='android'
              style={styles.listLine}
              androidColor={backgroundColor}
              onPress={() => {
                setModalThanks(true);
              }}
            >
              <Text style={[styles.listLineText, { fontSize }]}>感谢</Text>
            </Button>
            <View style={styles.border}></View>
            <Button
              mode='android'
              style={styles.listLine}
              androidColor={backgroundColor}
              onPress={() => {
                setModalUpdate(true);
              }}
            >
              <Text style={[styles.listLineText, { fontSize }]}>更新说明</Text>
            </Button>
          </View>
          <View style={styles.appInfo}>
            <Text
              style={[styles.infoText, { fontSize: fontSize * .9 }]}
            >
              {appName}是一款账号记录工具
          </Text>
            <Text
              style={[styles.infoText, { fontSize: fontSize * .9 }]}
            >
              简单、安全、好用，是它的追求
          </Text>
          </View>
        </ScrollView>
        <View style={styles.powerBox}>
          <Text
            style={[styles.poweredText, { fontSize: fontSize * .9 }]}
          >
            Powered by XieK
        </Text>
        </View>
        <ModalThanks visible={modalThanks} onClose={flag => {
          setModalThanks(flag);
        }} />
        <ModalUpdate visible={modalUpdate} onClose={flag => {
          setModalUpdate(flag);
        }} />
        <ModalSomething visible={modalSomething} onClose={flag => {
          setModalSomething(flag);
        }} />
        <ModalService visible={modalService} onClose={flag => {
          setModalService(flag);
        }} />
        <ModalEgg visible={modalEgg} onClose={flag => {
          setModalEgg(flag);
        }} />
        {
          eggFlag ? eggRandomFlag.current ? (
            <Image
              source={require('../../images/about-bg-left.png')}
              style={styles.eggLeftBg}
            />
          ) : (
              <Image
                source={require('../../images/about-bg-right.png')}
                style={styles.eggRightBg}
              />
            ) : null
        }
      </View>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  aboutBox: {
    justifyContent: 'space-between',
    // minHeight: '100%',
    position: 'relative',
  },
  appInfo: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  iconBox: {
    alignItems: 'center',
    marginTop: 36,
  },
  infoText: {
    paddingVertical: 2,
  },
  powerBox: {
    alignItems: 'center',
    marginBottom: 5,
  },
  poweredText: {
    color: '#999',
  },
  version: {
    color: '#999',
  },
  appName: {
    marginTop: 15,
  },
  listBox: {
    marginTop: 30,
    backgroundColor: '#fff',
  },
  border: {
    marginHorizontal: 10,
    height: 1,
    backgroundColor: '#eee',
  },
  listLine: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  listLineText: {
    color: '#333',
  },
  kumaIcon: {
    width: 50,
    height: 50,
  },
  eggLeftBg: {
    position: 'absolute',
    left: 0,
    bottom: 50,
    width: 60,
    resizeMode: 'contain',
    height: 120,
  },
  eggRightBg: {
    position: 'absolute',
    right: 0,
    bottom: 50,
    width: 80,
    resizeMode: 'contain',
    height: 115,
  },
});
