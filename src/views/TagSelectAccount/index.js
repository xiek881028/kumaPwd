import React, { useEffect, useContext, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { observer } from 'mobx-react';
import Button from '../../components/button';
import style from '../../css/common.js';
import BasePage from '../../components/basePage';
import List from '../../components/list.js';

export default observer(({ navigation, route }) => {
  const { params } = route;
  const { fontSize, backgroundColor, backgroundDarkColor, backgroundDisabled } = useContext(CTX_THEME);
  const { list, cls } = useContext(CTX_LIST);
  const [viewList, setViewList] = useState([]);
  const activeSet = useRef(new Set(params?.ids ?? []));
  const submitOnoff = useRef(false);
  const matchChange = () => {
    const hasChange = activeSet.current.size;
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.headerRightBtnWrap, { backgroundColor: hasChange ? backgroundColor : backgroundDisabled }]}
            underlayColor={backgroundDarkColor}
            disabled={!hasChange}
            activeOpacity={.6}
            onPress={async () => {
              if(submitOnoff.current) return; // 防止重复提交
              submitOnoff.current = true;
              navigation[params?.replace ? 'replace' : 'navigate']('TagEdit', { ids: Array.from(activeSet.current) });
            }}
          >
            <Text
              style={[style.headerRightBtnText, { fontSize: fontSize * 0.875 }]}
            >确定{!!hasChange ? `(${hasChange})` : ``}</Text>
          </Button>
        );
      },
    });
  };
  useEffect(() => {
    matchChange();
  }, []);
  useEffect(() => {
    setViewList(cls.activeList(activeSet.current));
  }, [list]);
  return (
    <BasePage>
      <View style={styles.wrap}>
        {list.length ?
          (<List
            sections={viewList}
            prefix={item => {
              const { isActive } = item;
              return (
                <View style={[styles.prefix]}>
                  <Feather
                    name={isActive ? 'check-circle' : 'circle'}
                    size={20}
                    style={[styles.radioDefault, { color: isActive ? backgroundColor : '#aaa' }]}
                  />
                </View>
              );
            }}
            onPress={({ data }) => {
              const { id } = data;
              activeSet.current[activeSet.current.has(id) ? 'delete' : 'add'](id);
              setViewList(cls.activeList(activeSet.current));
              matchChange();
            }}
          />) : (
            <View style={[styles.emptyBox]}>
              <Text style={[styles.emptyYan, { fontSize: fontSize * .9 }]}>(｡・`ω´･)</Text>
              <Text style={[styles.emptyTxt, { fontSize: fontSize * 1.2 }]}>万事皆空</Text>
            </View>
          )
        }
      </View>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    marginTop: 1,
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
  emptyTxt: {
    color: '#333',
    marginHorizontal: 10,
  },
  prefix: {
    height: '100%',
    justifyContent: 'center',
  },
  radioDefault: {
    paddingLeft: 15,
  },
  radioCheck: {
    color: '#1AAD19',
  },
});
