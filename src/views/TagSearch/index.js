import React, { useEffect, useContext, useState, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Keyboard,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { observer } from 'mobx-react';
import Button from '../../components/button';
import style from '../../css/common';
import Tag from '../../components/tag';
import List from '../../components/list';
import BasePage from '../../components/basePage';

export default observer(({ navigation }) => {
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const { tagList, cls, list } = useContext(CTX_LIST);
  const mathHeight = line => {
    // tag高度，计算规则见component/tag.js
    const lineHeight = fontSize * 1.15 + 6 + 2 + 10;
    // wrap高度 = tag高度 * 行数 + 上下padding
    return 30 + lineHeight * line;
  };
  let openUp = useRef(false);
  const animateHeight = useRef(new Animated.Value(mathHeight(2)));
  const animateDeg = useRef(new Animated.Value(0));
  const ids = useRef(new Set());
  const [viewList, setViewList] = useState([]);
  const [height, setHeight] = useState(0);
  const move = bool => {
    openUp.current = !bool;
    Animated.timing(animateHeight.current, {
      toValue: openUp.current ? mathHeight(5) : mathHeight(2),
      duration: 300,
      useNativeDriver: false,
    }).start();
    Animated.timing(animateDeg.current, {
      toValue: openUp.current ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            mode='android'
            androidColor='#999'
            borderless={true}
            rippleRadius={16}
            style={styles.headerBtn}
            onPress={() => {
              navigation.navigate('TagConfig');
            }}
          >
            <Feather
              name="settings"
              size={20}
              color={style.headerTitleIcon.color}
            />
          </Button>
        );
      },
    });
  }, []);
  useEffect(() => {
    // 列表改动及时更新
    list && setViewList(cls.findTagListById(Array.from(ids.current)));
  }, [list]);
  useEffect(() => {
    if (tagList !== undefined) {
      // tag删除后，更新选择状态（tagList与ids.current取交集）
      ids.current = new Set((tagList.map(item => item.id)).filter(x => ids.current.has(x)));
      setViewList(cls.findTagListById(Array.from(ids.current)));
    }
  }, [tagList]);
  return (
    <BasePage>
      {tagList ? tagList.length ? (
        <View style={styles.wrap}>
          <Animated.View style={[styles.searchWrap, { maxHeight: animateHeight.current }]}>
            <ScrollView>
              <View style={styles.tagList}>
                {tagList.map(item => <Tag key={item.id} onPress={(activity, fn) => {
                  if (activity) {
                    ids.current.add(item.id);
                  } else {
                    ids.current.delete(item.id);
                  }
                  setViewList(cls.findTagListById(Array.from(ids.current)));
                  fn(activity);
                }}>{item.name}</Tag>)}
              </View>
            </ScrollView>
          </Animated.View>
          <Button
            mode='android'
            androidColor='#efefef'
            underlayColor='#efefef'
            style={[styles.moreBtn, { borderBottomColor: backgroundColor }]} onPress={() => move(openUp.current)}
          >
            <Animated.View
              style={[{
                transform: [
                  {
                    rotateX: animateDeg.current.interpolate({
                      inputRange: [0, .25, .5, .75, 1],
                      outputRange: ['0deg', '45deg', '90deg', '135deg', '180deg'],
                    }),
                  },
                ],
              }]}
            >
              <Feather
                name='chevron-down'
                style={[styles.moreIcon, { fontSize: fontSize * 1.2, color: backgroundColor }]}
              />
            </Animated.View>
          </Button>
          <View
            style={[styles.listWrap, viewList.length ? '' : styles.emptyWrap]}
            onLayout={e => {
              setHeight(e.nativeEvent.layout.height);
            }}
          >
            {viewList.length ? (
              <List
                sections={viewList}
                height={height}
                onPress={({ data }) => {
                  Keyboard.dismiss();
                  navigation.navigate('Details', { id: data.id });
                }}
              />
            ) : (
                <Text style={[styles.emptyText, { fontSize }]}>点击标签可筛选账号，标签可以多选哦~</Text>
              )}
          </View>
        </View>
      ) : (
          <View style={[styles.emptyTagWrap]}>
            <Text style={[styles.yan, { fontSize: fontSize * 1.1 }]}>(´･ω･`)</Text>
            <Text style={[styles.emptyTagTxt, { fontSize }]}>首次使用是有点复杂呢，先去新增标签吧</Text>
          </View >
        ) : null
      }
    </BasePage >
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  headerBtn: {
    marginRight: 12,
    paddingHorizontal: 6,
    paddingVertical: 10,
    // backgroundColor: '#c00',
    // borderWidth: 1,
  },
  searchWrap: {
    backgroundColor: '#fafafa',
  },
  emptyWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 18,
  },
  yan: {
    paddingBottom: 10,
    color: '#333',
  },
  emptyTagTxt: {
    color: '#333',
  },
  emptyTagWrap: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  infoIcon: {
    marginRight: 3,
    color: '#999',
  },
  emptyText: {
    color: '#999',
  },
  moreBtn: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3,
    // borderBottomWidth: 3,
    elevation: 15,
  },
  moreIcon: {},
  tagList: {
    flexDirection: 'row',
    // justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: 15,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  listWrap: {
    flex: 1
  },
});
