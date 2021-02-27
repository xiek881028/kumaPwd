import React, { useState, memo, useContext, useEffect, useRef } from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { observer } from 'mobx-react';
import CryptoJS from 'crypto-js';
import AliPayAndroid from '../../../NativeModules/AliPayAndroid';
import ModalBase from '../../../components/modalBase';
import InputView from '../../../components/inputView';
import Button from '../../../components/button';
import useAsync from '../../../helper/useAsync';
import { setStorage } from '../../../helper';

//Css
import style from '../../../css/common.js';

export default memo(observer(({ visible, onClose }) => {
  console.log(`~~modalAliPay 渲染函数执行~~`);
  const { fontSize, backgroundColor, backgroundDisabled } = useContext(CTX_THEME);
  const { done, setEggFn } = useContext(CTX_EGG);
  const [aliPay, setAliPay] = useState(true);
  const [eggStart, setEggStart] = useState(false);
  const [eggText, setEggText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [answerErr, setAnswerErr] = useState(null);
  const answer = useRef('');
  const timer = useRef();
  const useAsyncFlag = useAsync();
  useEffect(() => {
    if (!visible) {
      clearTimeout(timer.current);
      if (useAsyncFlag.current) {
        setEggStart(false);
        setEggText('');
        setShowInput(false);
        setCanSubmit(false);
        setAnswerErr(null);
      }
    }
  }, [visible]);
  useEffect(() => {
    if (eggStart) {
      clearTimeout(timer.current);
      setShowInput(false);
      setCanSubmit(false);
      setAnswerErr(null);
      moveText(1);
    }
  }, [eggStart]);
  const moveText = index => {
    timer.current = setTimeout(() => {
      const text = '...？嗷呜嗷呜嗷呜嗷呜？嗷呜？嗷呜嗷呜嗷呜嗷呜？';
      if (index <= text.length && useAsyncFlag.current) {
        setEggText(text.slice(0, index));
        moveText(index + 1);
      } else {
        setShowInput(true);
      }
    }, 250);
  };
  const answerFn = () => {
    // 给彩蛋来一点神秘感~
    if (CryptoJS.SHA3(answer.current, { outputLength: 224 }).toString() === 'dd1e93e55caa2b3b97a5c65ca491e663c52a93694d7fd359b02f83b4') {
      setEggText('一只未知的生物入侵了APP！KUMA！！！');
      setAnswerErr(false);
      setEggFn('done', true);
      setEggFn('flag', true);
      setStorage('egg', true);
      setStorage('eggDone', true);
    } else {
      setEggText('喵喵似乎听不懂你在说什么...');
      setAnswerErr(true);
    }
  };
  return (
    <ModalBase
      visible={visible}
      onClose={() => {
        (onClose ?? (() => { }))(false);
      }}
    >
      {aliPay ?
        <View
          style={style.modalBox}
        >
          <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>投喂</Text>
          {eggStart ? (
            <>
              <ScrollView contentContainerStyle={[style.modalContent]}>
                <View style={[styles.catWrap]}>
                  <Image
                    source={require('../../../images/alipay-cat.gif')}
                    style={styles.catIcon}
                  />
                  <Text style={[styles.modalText, styles.eggText, { fontSize }]}>{eggText}</Text>
                </View>
                {answerErr === false ? (
                  <Text style={[styles.modalText, styles.eggText, styles.eggTips, { fontSize: fontSize * .9 }]}>tips：可在高级设置中关闭彩蛋展示</Text>
                ) : null}
                {showInput && answerErr === null ? (
                  <View style={[styles.inputWrap]}>
                    <InputView
                      autoFocus={true}
                      keyboardType='numeric'
                      placeholder='回应暗号（4位数字，注意喵喵说的话）'
                      onChangeText={val => {
                        setCanSubmit(val.length === 4);
                        answer.current = val;
                      }}
                      onSubmitEditing={() => {
                        answerFn();
                      }}
                      maxLength={4}
                      fontSize={fontSize}
                    />
                  </View>
                ) : null}
              </ScrollView>
              <View style={style.modalFooter}>
                <Button
                  mode='android'
                  androidColor={style.btnSubHeightBg.backgroundColor}
                  style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
                  underlayColor={style.btnSubHeightBg.backgroundColor}
                  onPress={() => {
                    (onClose ?? (() => { }))(false);
                  }}
                >
                  <Text
                    style={[style.btnSubColor, style.modalFooterBtn, { fontSize }]}
                  >关闭</Text>
                </Button>
                {answerErr === null ? (
                  <Button
                    mode='android'
                    androidColor={backgroundColor}
                    style={[style.modalFooterBtnbox, { backgroundColor: !canSubmit ? backgroundDisabled : backgroundColor }]}
                    disabled={!canSubmit}
                    underlayColor={backgroundColor}
                    onPress={async () => {
                      answerFn();
                    }}
                  >
                    <Text
                      style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
                    >回应</Text>
                  </Button>
                ) : answerErr ? (
                  <Button
                    mode='android'
                    androidColor={backgroundColor}
                    style={[style.modalFooterBtnbox, { backgroundColor }]}
                    underlayColor={backgroundColor}
                    onPress={async () => {
                      clearTimeout(timer.current);
                      setEggText('');
                      setShowInput(false);
                      setCanSubmit(false);
                      setAnswerErr(null);
                      moveText(1);
                    }}
                  >
                    <Text
                      style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
                    >再猜一次</Text>
                  </Button>
                ) : null}
              </View>
            </>
          ) : (
              <>
                <ScrollView contentContainerStyle={[style.modalContent]}>
                  <View style={[styles.catWrap]}>
                    <Image
                      source={require('../../../images/alipay-cat.gif')}
                      style={styles.catIcon}
                    />
                    <Text style={[styles.modalText, { fontSize }]}>喵~喵喵~~喵喵喵~~~</Text>
                  </View>
                  <Text style={[styles.modalText, { fontSize }]}>Ps：只支持用支付宝进行投喂。</Text>
                </ScrollView>
                <View style={style.modalFooter}>
                  <Button
                    mode='android'
                    androidColor={style.btnSubHeightBg.backgroundColor}
                    style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
                    underlayColor={style.btnSubHeightBg.backgroundColor}
                    onPress={() => {
                      (onClose ?? (() => { }))(false);
                    }}
                  >
                    <Text
                      style={[style.btnSubColor, style.modalFooterBtn, { fontSize }]}
                    >取消</Text>
                  </Button>
                  <Button
                    mode='android'
                    androidColor={backgroundColor}
                    style={[style.modalFooterBtnbox, { backgroundColor }]}
                    underlayColor={backgroundColor}
                    onPress={async () => {
                      AliPayAndroid.pay('HTTPS://QR.ALIPAY.COM/FKX01558R6UKNKBCBHOH83', d => {
                        if (!d.flag) {
                          setAliPay(false);
                        } else {
                          (onClose ?? (() => { }))(false);
                        }
                      });
                    }}
                  >
                    <Text
                      style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
                    >确定</Text>
                  </Button>
                  {done ? null : (
                    <Button
                      mode='android'
                      androidColor={backgroundColor}
                      style={[style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
                      underlayColor={backgroundColor}
                      onPress={async () => setEggStart(true)}
                    >
                      <Text
                        style={[style.modalFooterBtn, { fontSize, color: '#666' }]}
                      >嗷呜~</Text>
                    </Button>
                  )}
                </View>
              </>
            )}
        </View >
        :
        <View
          style={style.modalBox}
        >
          <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>投喂失败</Text>
          <ScrollView contentContainerStyle={[style.modalContent]}>
            <Text style={[styles.modalText, { fontSize }]}>喵~~~嗷呜~~~</Text>
          </ScrollView>
          <View style={style.modalFooter}>
            <Button
              mode='android'
              androidColor={style.btnSubHeightBg.backgroundColor}
              style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
              underlayColor={style.btnSubHeightBg.backgroundColor}
              onPress={() => {
                (onClose ?? (() => { }))(false);
              }}
            >
              <Text
                style={[style.btnSubColor, style.modalFooterBtn, { fontSize }]}
              >关闭</Text>
            </Button>
          </View>
        </View>
      }
    </ModalBase >
  );
}), (prev, next) => {
  return prev.visible === next.visible;
});

const styles = StyleSheet.create({
  catWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalText: {
    color: '#666',
  },
  catIcon: {
    marginRight: 6,
    width: 44,
    height: 30,
  },
  eggText: {
    flex: 1,
  },
  inputWrap: {
    marginTop: 10,
  },
  eggTips: {
    marginTop: 10,
    color: '#999',
  },
});
