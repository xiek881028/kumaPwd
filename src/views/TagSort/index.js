import React, { useEffect, useContext, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { observer } from 'mobx-react';
import { DragSortableView } from 'react-native-drag-sort';
import Button from '../../components/button';
import style from '../../css/common.js';
import BasePage from '../../components/basePage';

const itemHeight = 60;

export default observer(({ navigation }) => {
  const { fontSize, backgroundColor, backgroundDarkColor } = useContext(CTX_THEME);
  const { tagList, setTagFn, cls } = useContext(CTX_LIST);
  const [lockScroll, setLockScroll] = useState(true);
  const itemWidth = useRef(Dimensions.get('window').width);
  const [sortList, setSortList] = useState(tagList);
  const submitOnoff = useRef(false);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View
            style={style.headerRightBox}
          >
            <Button
              mode='android'
              androidColor={backgroundColor}
              style={[style.headerRightBtnWrap, { backgroundColor }]}
              underlayColor={backgroundDarkColor}
              activeOpacity={.6}
              onPress={async () => {
                if (submitOnoff.current) return; // 防止重复提交
                submitOnoff.current = true;
                await cls.tagSort(sortList);
                await cls.init();
                setTagFn(cls.tagViewList);
                navigation.navigate('TagConfig');
              }}
            >
              <Text
                style={[style.headerRightBtnText, { fontSize: fontSize * 0.875 }]}
              >完成</Text>
            </Button>
          </View>
        );
      },
    });
  }, [sortList]);
  return (
    <BasePage>
      <View style={styles.wrap}>
        <View style={[styles.helpWrap]}>
          <Feather
            name='help-circle'
            style={[styles.helpIcon, { fontSize: fontSize * 1.2 }]}
          />
          <Text style={[styles.helpText, { fontSize }]}>长按标签拖拽排序</Text>
        </View>
        <ScrollView scrollEnabled={lockScroll} style={[styles.dragWrap]}>
          <DragSortableView
            dataSource={sortList}
            childrenWidth={itemWidth.current}
            childrenHeight={itemHeight}
            delayLongPress={200}
            marginChildrenBottom={1}
            renderItem={item => {
              return (
                <View
                  style={[styles.itemWrap, { width: itemWidth.current, height: itemHeight }]}
                >
                  <Text style={[{ fontSize: fontSize * 1.05 }]}>{item.name}</Text>
                  <Feather
                    name='menu'
                    style={[{ fontSize: fontSize * 1.4 }]}
                  />
                </View>
              );
            }}
            onDataChange={list => setSortList(list)}
            onDragStart={() => setLockScroll(false)}
            onDragEnd={() => setLockScroll(true)}
          />
        </ScrollView>
      </View>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    marginTop: 1,
  },
  tagList: {
    flexDirection: 'row',
    // justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: 15,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  itemWrap: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  helpWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#ebebeb',
    height: 34,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  helpIcon: {
    color: '#999',
    marginRight: 4,
  },
  helpText: {
    color: '#999',
  },
  dragWrap: {
    marginTop: 34,
  },
});
