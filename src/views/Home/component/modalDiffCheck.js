import React, { memo, useContext, useEffect, useState, useRef } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { observer } from 'mobx-react';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import style from '../../../css/common.js';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';
import TabsAnimate from './tabsAnimate';

export default memo(observer(({ visible, onClose, onOk, data }) => {
  console.log(`~~差异检查弹窗 渲染函数执行~~`);
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const [active, setActive] = useState(0);
  // 屏幕宽度 - modal的margin * 2 - context的margin * 2
  const width = Dimensions.get('window').width - 10 * 2;
  const swiperRef = useRef(null);
  const animateWidth = useRef(new Animated.Value(0));
  const move = active => {
    Animated.timing(animateWidth.current, {
      toValue: active ? 0 : 50,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  useEffect(() => {
    move(false);
  }, []);
  const mathMode = child => {
    const { mode } = child;
    const colorObj = {
      add: '#2ecc71',
      edit: '#f1c40f',
      del: '#ff5053',
    };
    const iconObj = {
      add: 'plus-square',
      edit: 'edit',
      del: 'trash-2',
    };
    const textObj = {
      add: '新增了',
      edit: '修改了',
      del: '删除了',
    };
    return {
      color: colorObj[mode],
      icon: iconObj[mode],
      text: mode == 'edit' ? `${child.name} ${textObj[mode]} ${child.keyName}` : `${textObj[mode]} ${child.name}`,
    };
  };
  return (
    <ModalBase
      visible={visible}
      onClose={() => (onClose ?? (() => { }))(false)}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>未备份的修改</Text>
        <View>
          <View style={[styles.rootWrap]}>
            {Object.keys(data.data).map((type, index) => {
              const { len, name } = data.data?.[type];
              return (
                <TabsAnimate
                  key={name}
                  onPress={() => {
                    setActive(index);
                    swiperRef.current.scrollToIndex({ index });
                  }}
                  data={{ name, len }}
                  active={active == index}
                />
              );
            })}
          </View>
          <SwiperFlatList
            ref={swiperRef}
            data={[data.data.account, data.data.tag]}
            onMomentumScrollEnd={index => setActive(index.index)}
            renderItem={({ item }) => {
              const list = (item?.allChange ?? []);
              return (
                <View style={[styles.swiperPage, { width }]}>
                  <ScrollView contentContainerStyle={[styles.scrollWrap]}>
                    {list.length ? list.map((child, index) => {
                      const { color, icon, text } = mathMode(child);
                      return (
                        <View style={[styles.swiperItem]} key={index + ''}>
                          <Feather
                            name={icon}
                            size={fontSize * 1.2}
                            style={[styles.icon]}
                            color={color}
                          />
                          <Text style={[{ fontSize, color }]}>{text}</Text>
                        </View>
                      );
                    }) : (
                        <View style={[styles.emptyWrap]}>
                          <Text style={[styles.emptyText]}>暂无改动</Text>
                        </View>
                      )}
                  </ScrollView>
                </View>
              )
            }
            }
          />
        </View>
        <View style={style.modalFooter}>
          <Button
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
            underlayColor={style.btnSubHeightBg.backgroundColor}
            onPress={() => (onClose ?? (() => { }))(false)}
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
            onPress={async () => (onOk ?? (() => { }))(true)}
          >
            <Text
              style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
            >立即备份</Text>
          </Button>
        </View>
      </View>
    </ModalBase >
  );
}), (prev, next) => {
  return prev.visible === next.visible && prev.data === next.data && prev.onOk === next.onOk;
});

const styles = StyleSheet.create({
  rootWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  swiperPage: {
    maxHeight: 360,
  },
  scrollWrap: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  swiperItem: {
    flexDirection: 'row',
    marginTop: 0,
    paddingVertical: 5,
    marginHorizontal: 20,
  },
  icon: {
    marginRight: 6,
  },
  emptyWrap: {
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 5,
  },
  emptyText: {
    color: '#888',
  },
});
