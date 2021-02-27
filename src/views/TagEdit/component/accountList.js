import React, { useEffect, useContext, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { observer } from 'mobx-react';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../../components/button';
import { useNavigation } from '@react-navigation/native';
import style from '../../../css/common.js';

export default observer(({ ids, onChange }) => {
  const navigation = useNavigation();
  const { fontSize, backgroundColor, backgroundDarkColor } = useContext(CTX_THEME);
  const { list, cls } = useContext(CTX_LIST);
  const [viewList, setViewList] = useState([]);
  const [idsArr, setIdsArr] = useState(ids);
  useEffect(() => {
    setViewList(cls.findListById(idsArr));
  }, [list, idsArr]);
  useEffect(() => {
    setIdsArr(ids);
  }, [ids]);
  return (
    <>
      <View
        style={[styles.wrap, styles.addWrap, { borderColor: backgroundColor }]}
      >
        <Button
          mode='android'
          onPress={() => {
            navigation.push('TagSelectAccount', { ids: idsArr });
          }}
          underlayColor='#d9d9d9'
          androidColor={backgroundColor}
          style={[styles.btnWrap]}
        >
          <>
            <Text style={[styles.info, { fontSize: fontSize * .9, color: backgroundColor }]}>{viewList.length ? '调整' : '添加'}账号</Text>
            <Feather
              name={viewList.length ? 'edit' : 'plus-circle'}
              size={fontSize * .9 + 3}
              style={[styles.icon, { color: backgroundColor }]}
            />
          </>
        </Button>
      </View>
      {
        viewList.map((item, key) => {
          return (
            <View
              style={[styles.wrap, { backgroundColor }]}
              key={key}
            >
              <Text numberOfLines={1} style={[styles.info, { fontSize: fontSize * .9 }]}>{item.name}</Text>
              <Button
                mode='android'
                androidColor='#999'
                borderless={true}
                rippleRadius={16}
                onPress={() => {
                  const idsSet = new Set(idsArr);
                  idsSet.delete(item.id);
                  setIdsArr(Array.from(idsSet));
                  (onChange ?? (() => { }))(Array.from(idsSet));
                }}
              >
                <Feather
                  name='trash-2'
                  size={fontSize * .9 + 3}
                  style={[styles.icon]}
                />
              </Button>
            </View>
          );
        })
      }
    </>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 5,
    elevation: 2.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addWrap: {
    borderWidth: 1,
    elevation: 0,
  },
  info: {
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 12,
    flex: 1,
  },
  icon: {
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 12,
    flex: 0,
  },
  btnWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
