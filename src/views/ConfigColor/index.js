import React, { useEffect, useState, useContext, useRef } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import Color from 'color';
import BasePage from '../../components/basePage';
import Button from '../../components/button';
import { observer } from 'mobx-react';
import { colorList } from '../../config';

import { setTheme } from '../../helper';
//Css
import style from '../../css/common.js';

export default observer(({ navigation }) => {
  const { fontSize, backgroundColor, setThemeFn } = useContext(CTX_THEME);
  const [settingColor, setSettingColor] = useState(backgroundColor);
  const submitOnoff = useRef(false);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            mode='android'
            androidColor={settingColor}
            style={[style.headerRightBtnWrap, { backgroundColor: settingColor }]}
            underlayColor={Color(settingColor).darken(0.2).hex()}
            activeOpacity={.6}
            onPress={async () => {
              if (submitOnoff.current) return; // 防止重复提交
              submitOnoff.current = true;
              await setTheme('backgroundColor', settingColor);
              setThemeFn('backgroundColor', settingColor);
              setThemeFn('backgroundDarkColor', Color(settingColor).darken(0.2).hex());
              navigation.navigate('Config');
            }}
          >
            <Text
              style={[style.headerRightBtnText, { fontSize: fontSize * 0.875 }]}
            >完成</Text>
          </Button>
        );
      },
    });
  }, [settingColor]);
  return (
    <BasePage>
      <View style={[styles.configColorBox]}>
        <ScrollView style={styles.scrollList}>
          <View style={styles.colorBox}>
            {colorList.map((item, index) => {
              return (
                <Button
                  style={[styles.colorBlock, { height: fontSize * 4, backgroundColor: item }]}
                  key={index}
                  mode='android'
                  androidColor={Color(item).darken(0.2).hex()}
                  underlayColor={Color(item).darken(0.2).hex()}
                  onPress={() => {
                    setSettingColor(item);
                  }}
                >
                  <View style={[styles.colorViewBox]}>
                    <Text
                      style={[styles.colorText, { fontSize: fontSize * 1.2 }]}
                      numberOfLines={1}
                    >{item}</Text>
                    <Feather
                      name={settingColor == item ? "check-circle" : "circle"}
                      size={fontSize * 1.2}
                      color={'#fff'}
                    />
                  </View>
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  configColorBox: {
    justifyContent: 'space-between',
    flex: 1,
  },
  scrollList: {
    flex: 1,
  },
  colorBox: {
    margin: 5,
    flex: 0,
  },
  colorViewBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  colorBlock: {
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 3,
    justifyContent: 'center',
  },
  colorText: {
    marginRight: 15,
    color: '#fff',
    flex: 1,
  },
});
