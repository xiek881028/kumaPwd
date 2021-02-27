import React, { useEffect, useContext, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import nanoid from '../../helper/nanoid';
import { observer } from 'mobx-react';
import InputView from '../../components/inputView';
import Button from '../../components/button';
import style from '../../css/common.js';
import BasePage from '../../components/basePage';
import AccountList from './component/accountList';
import ModalDel from './component/modalDel';

export default observer(({ navigation, route }) => {
  const { params } = route;
  const isEdit = !!params?.id;
  const { fontSize, backgroundColor, backgroundDarkColor, backgroundDisabled, fontDisabled } = useContext(CTX_THEME);
  const { setTipsFn } = useContext(CTX_TIPS);
  const { setTagFn, cls } = useContext(CTX_LIST);
  // 删除tag后，状态依旧是edit，但details返回是undefined
  const origin = isEdit ? (cls.tagDetails(params.id) ?? {}) : {};
  const [ids, setIds] = useState(origin.accountList ?? []);
  const [modalFlag, setModalFlag] = useState(false);
  const submitOnoff = useRef(false);
  const data = useRef({
    id: isEdit ? origin.id : nanoid(),
    name: origin.name,
    index: origin.index,
    accountList: ids,
  });
  const isSave = useRef(false);
  const update = (name, val) => {
    const _data = data.current;
    if (name) {
      _data[name] = val;
    }
    const canSubmit = !!_data.name;
    navigation.setOptions({
      headerTitle: (<Text>{isEdit ? '编辑' : '新增'}标签</Text>),
      headerRight: () => {
        return (
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.headerRightBtnWrap, { backgroundColor: canSubmit ? backgroundColor : backgroundDisabled }]}
            disabled={!canSubmit}
            underlayColor={backgroundDarkColor}
            activeOpacity={.6}
            onPress={async () => {
              if (submitOnoff.current) return; // 防止重复提交
              submitOnoff.current = true;
              await cls[isEdit ? 'tagEdit' : 'tagAdd'](data.current);
              setTagFn(cls.tagViewList);
              isSave.current = true;
              setTipsFn('text', `${isEdit ? '编辑' : '添加'}成功`);
              navigation.navigate('TagConfig');
            }}
          >
            <Text
              style={[style.headerRightBtnText, { color: canSubmit ? '#fff' : fontDisabled, fontSize: fontSize * 0.875 }]}
            >完成</Text>
          </Button>
        );
      },
    });
  };
  useEffect(() => {
    if (params?.ids) {
      setIds(params.ids);
      update('accountList', params.ids);
    }
  }, [params]);
  useEffect(() => {
    update();
    navigation.addListener('beforeRemove', e => {
      if (isSave.current) return;
      let hasChange = false;
      for (const key in data.current) {
        // 有一处改动，直接退出循环
        if (hasChange) break;
        if (key === 'id') { // 新增情况下，不匹配id修改情况
          if (isEdit) {
            hasChange = data.current.id !== origin.id;
          } else {
            hasChange = false;
          }
        } else if (key === 'accountList') {
          const len = origin?.accountList ?? [];
          if (len.length !== data.current.accountList.length) {
            hasChange = true;
            break;
          }
          for (let i = 0, max = len.length; i < max; i++) {
            const el = len[i];
            if (data.current.accountList[i].id !== el.id) {
              hasChange = true;
              break;
            }
          }
        } else {
          hasChange = data.current[key] !== origin[key];
        }
      }
      if (hasChange) {
        e.preventDefault();
        Alert.alert('注意', '发现未保存的修改，是否继续退出？', [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '确定',
            onPress: () => {
              isSave.current = true;
              navigation.navigate('TagConfig');
            },
          },
        ]);
      }
    });
  }, []);
  return (
    <BasePage>
      <ScrollView
        // 当点击事件被子组件捕获时，键盘不会自动收起。这样切换 TextInput 时键盘可以保持状态
        keyboardShouldPersistTaps='handled'
      >
        <View>
          <View style={styles.groupTitle}>
            <Text style={[styles.groupTitleText, { fontSize }]}>标签名称</Text>
            <Text style={[styles.warning, { fontSize: fontSize * .8 }]}>(必填)</Text>
          </View>
          <View style={styles.groupInput}>
            <InputView
              placeholder='点这里输入标签名称'
              onChangeText={update.bind(this, 'name')}
              defaultValue={data.current.name}
              autoFocus={!isEdit}
              maxLength={50}
            />
          </View>
        </View>
        <View>
          <View style={styles.groupTitle}>
            <Text style={[styles.groupTitleText, { fontSize }]}>已选账号</Text>
          </View>
          <View style={styles.listWrap}>
            <AccountList
              ids={ids}
              onChange={_ids => {
                setIds(_ids);
                update('accountList', _ids);
              }}
            />
          </View>
        </View>
        {isEdit ? <>
          <View>
            <View style={[styles.delWrap]}>
              <Button
                mode='android'
                androidColor='#ff5053'
                onPress={() => {
                  setModalFlag(true);
                }}
                underlayColor={style.btnSubHeightBg.backgroundColor}
                style={[styles.btnBox]}
              >
                <Text style={[styles.btn, { fontSize: fontSize * 1.125 }]}>删除标签</Text>
              </Button>
            </View>
          </View>
          <ModalDel
            visible={modalFlag}
            onClose={async flag => {
              setModalFlag(false);
              flag && navigation.navigate('TagConfig');
            }}
            info={data.current}
          />
        </> : null}
      </ScrollView>
    </BasePage>
  );
});

const styles = StyleSheet.create({
  groupTitle: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitleText: {
    color: '#353535',
  },
  warning: {
    color: '#c00',
    marginLeft: 5,
  },
  groupInput: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  listWrap: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  btnBox: {
    marginHorizontal: 10,
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: '#ff5053',
  },
  btn: {
    lineHeight: 46,
    color: '#fff',
  },
  delWrap: {
    paddingTop: 24,
  },
});
