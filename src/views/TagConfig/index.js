import React, { useEffect, useContext, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { observer } from 'mobx-react';
import Button from '../../components/button';
import style from '../../css/common.js';
import BasePage from '../../components/basePage';

export default observer(({ navigation }) => {
  const { fontSize, backgroundColor, backgroundDarkColor } = useContext(CTX_THEME);
  const { tagList, setTagFn } = useContext(CTX_LIST);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View
            style={style.headerRightBox}
          >
            <Button
              mode='android'
              androidColor='#999'
              borderless={true}
              rippleRadius={16}
              style={[styles.headerBtn, styles.sortIcon]}
              onPress={() => navigation.navigate('TagSort')}
            >
              <Feather
                name="bar-chart"
                size={20}
                color={style.headerTitleIcon.color}
              />
            </Button>
            <Button
              mode='android'
              androidColor='#999'
              borderless={true}
              rippleRadius={16}
              style={styles.headerBtn}
              onPress={() => navigation.navigate('TagSelectAccount', { replace: 'true' })}
            >
              <Feather
                name="plus"
                size={20}
                color={style.headerTitleIcon.color}
              />
            </Button>
          </View>
        );
      },
    });
  }, []);
  const renderItem = useRef(({ item }) => {
    return (
      <Button
        mode='android'
        androidColor={backgroundColor}
        style={[styles.itemWrap]}
        onPress={() => navigation.navigate('TagEdit', { id: item.id })}
      >
        <Text
          style={[{ fontSize: fontSize * 1.05 }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </Button>
    );
  });
  return (
    <BasePage>
      <View style={styles.wrap}>
        {
          tagList.length ? (
            <FlatList
              data={tagList}
              keyExtractor={item => item.id}
              renderItem={renderItem.current}
              initialNumToRender={20}
              ItemSeparatorComponent={() => <View style={[styles.line]}></View>}
            />
          ) : (
              <View style={[styles.emptyBox]}>
                <Text style={[styles.emptyYan, { fontSize: fontSize * .9 }]}>(｡ŏ﹏ŏ)</Text>
                <Text style={[styles.emptyTxt, { fontSize: fontSize * 1.2 }]}>啊噢，没有标签呢</Text>
                <Button
                  mode='android'
                  androidColor={backgroundColor}
                  style={[styles.addBtn, { backgroundColor }]}
                  underlayColor={backgroundDarkColor}
                  activeOpacity={.6}
                  onPress={async () => navigation.navigate('TagSelectAccount')}
                >
                  <Text
                    style={[styles.addBtnText, { fontSize }]}
                  >添加标签</Text>
                </Button>
              </View>
            )
        }
      </View>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  headerBtn: {
    marginRight: 12,
    paddingHorizontal: 6,
    paddingVertical: 10,
    // backgroundColor: '#c00',
    // borderWidth: 1,
  },
  sortIcon: {
    transform: [
      { rotateZ: '90deg' },
      { rotateY: '180deg' },
    ],
  },
  wrap: {
    flex: 1,
    marginTop: 1,
  },
  itemWrap: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  line: {
    height: 1,
  },
  emptyBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#ebebeb',
  },
  emptyYan: {
    color: '#333',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  addBtn: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 3,
  },
  addBtnText: {
    color: '#fff',
  },
});
