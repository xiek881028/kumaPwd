import React, { useEffect, useContext, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Keyboard,
} from 'react-native';
import { observer } from 'mobx-react';
import style from '../../css/common.js';
import InputView from '../../components/inputView';
import List from '../../components/list.js';
import BasePage from '../../components/basePage';

export default observer(props => {
  const { navigation } = props;
  const { fontSize } = useContext(CTX_THEME);
  const { list, cls } = useContext(CTX_LIST);
  const [searchList, setSearchList] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const timer = useRef(null);
  // 列表初始化
  useEffect(() => {
    // 列表改动同步到搜索列表
    list && setSearchList(cls.searchList(searchKey));
  }, [list]);
  // 顶部title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <InputView
            placeholder='搜索'
            autoFocus={true}
            isSearch={true}
            searchKey={searchKey}
            warpStyle={styles.inpitWarpStyle}
            maxLength={128}
            onChangeText={val => { // 延时300ms查询，避免多次渲染
              clearTimeout(timer.current);
              timer.current = setTimeout(() => {
                setSearchKey(val);
                setSearchList(cls.searchList(val));
              }, 300);
            }}
          />
        );
      },
    });
    return () => {
      clearTimeout(timer.current);
    };
  }, []);
  return (
    <BasePage>
      {searchList.length ?
        (<List
          sections={searchList}
          isSearch={true}
          searchKey={searchKey}
          onPress={({ data }) => {
            Keyboard.dismiss();
            navigation.navigate('Details', { id: data.id });
          }}
        />) : searchKey ? (
          <View style={styles.searchEmptyBox}>
            <Text style={[styles.searchEmptyTxt, { fontSize }]}>搜索不到相关结果</Text>
          </View>
        ) : (
            <View style={styles.searchEmptyBox}>
              <Text style={[styles.searchEmptyTxt, { fontSize }]}>搜索关键词可以是名称或账号</Text>
            </View>)
      }
    </BasePage>
  );
});

const styles = StyleSheet.create({
  inpitWarpStyle: {
    marginRight: 30,
  },
  searchEmptyBox: {
    alignItems: 'center',
  },
  searchEmptyTxt: {
    marginTop: 15,
    marginHorizontal: 20,
    color: '#999',
  },
});
