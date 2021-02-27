import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Keyboard,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react';
import nanoid from '../../helper/nanoid';
import { decrypt, encrypt } from '../../helper/crypto';
import Feather from 'react-native-vector-icons/Feather';
import InputView from '../../components/inputView';
import PinYin from '../../assets/pinyin/pinyin';
import BasePage from '../../components/basePage';
import Button from '../../components/button';
import Tag from '../../components/tag';
import ModalAdd from './component/modalAdd';
import style from '../../css/common.js';

export default observer(({ route, navigation }) => {
  const { params } = route;
  const { cls, tagList, setListFn, setTagFn } = useContext(CTX_LIST);
  const { fontSize, backgroundColor, backgroundDisabled, fontDisabled } = useContext(CTX_THEME);
  const { setTipsFn } = useContext(CTX_TIPS);
  const { pwd: savePwd } = useContext(CTX_USER);
  const [addFlag, setAddFlag] = useState(false);
  const [newList, setNewList] = useState([]);
  const submitOnoff = useRef(false);
  const isEdit = !!params?.id;
  const origin = isEdit ? cls.details(params?.id) : { tags: [] }; // 初始化加入tags防止新增时报错
  const data = useRef({
    id: isEdit ? origin.id : nanoid(),
    account: origin.account,
    name: origin.name,
    tags: isEdit ? [...origin.tags] : [], // 解构，否则内存引用相同，无法侦测是否改动
    pwd: decrypt(origin.pwd ?? '', savePwd),
  });
  const isSave = useRef(false);
  const saveFn = async () => { // 局部更新耗时在250~300ms范围内，全量更新耗时在280~330ms，优化会使更新逻辑复杂化，优化有待商榷
    if (submitOnoff.current) return; // 防止重复提交
    submitOnoff.current = true;
    Keyboard.dismiss();
    const diffTagObj = {
      add: [],
      del: [],
      _new: [],
    };
    const allSet = new Set();
    const originSet = new Set();
    const dataSet = new Set();
    for (let i = 0, max = origin.tags.length; i < max; i++) {
      allSet.add(origin.tags[i].id);
      originSet.add(origin.tags[i].id);
    }
    for (let i = 0, max = data.current.tags.length; i < max; i++) {
      allSet.add(data.current.tags[i].id);
      dataSet.add(data.current.tags[i].id);
    }
    for (let i = 0, max = newList.length; i < max; i++) {
      diffTagObj._new.push({
        name: newList[i],
        id: nanoid(),
      });
    }
    // 需要删除的
    diffTagObj.del = Array.from(allSet).filter(v => originSet.has(v) && !dataSet.has(v));
    // 需要添加的
    diffTagObj.add = Array.from(allSet).filter(v => dataSet.has(v) && !originSet.has(v));
    const save = { ...origin, ...data.current };
    delete save.tags;
    save.diffTagObj = diffTagObj;
    save.pinyin = PinYin(save.name);
    if (save.pwd !== '') {
      save.pwd = encrypt(save.pwd, savePwd);
    }
    isEdit ? await cls.edit(save) : await cls.add(save);
    setListFn(cls.viewList);
    setTagFn(cls.tagViewList);
    isSave.current = true;
    setTipsFn('text', `${isEdit ? '编辑' : '新增'}成功`);
    navigation.navigate(isEdit ? 'Details' : 'Home');
  };
  const update = (name, val) => {
    const _data = data.current;
    if (name) {
      _data[name] = val;
    }
    const canSubmit = !!(_data.name && _data.account);
    navigation.setOptions({
      headerTitle: (<Text>{isEdit ? '编辑' : '新增'}</Text>),
      headerRight: () => {
        return (
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[style.headerRightBtnWrap, { backgroundColor: canSubmit ? backgroundColor : backgroundDisabled }]}
            underlayColor={backgroundColor}
            disabled={!canSubmit}
            activeOpacity={.6}
            onPress={saveFn}
          >
            <Text
              style={[style.headerRightBtnText, { color: canSubmit ? '#fff' : fontDisabled, fontSize: fontSize * 0.875 }]}
            >完成</Text>
          </Button>
        );
      },
    });
  };
  // 新增tag变化时，主动触发更新，以便saveFn能拿到最新的改变值
  useEffect(() => {
    update();
  }, [newList]);
  useEffect(() => {
    update();
    navigation.addListener('beforeRemove', e => {
      if (isSave.current) return;
      let hasChange = false;
      for (const key in data.current) {
        // 有一处改动，直接退出循环
        if (hasChange) break;
        if (key === 'pwd') { // 密码先解密后匹配
          hasChange = data.current.pwd !== decrypt(origin.pwd ?? '', savePwd);
        } else if (key === 'id') { // 新增情况下，不匹配id修改情况
          if (isEdit) {
            hasChange = data.current.id !== origin.id;
          } else {
            hasChange = false;
          }
        } else if (key === 'tags') {
          const len = origin?.tags ?? [];
          if (len.length !== data.current.tags.length) {
            hasChange = true;
            break;
          }
          for (let i = 0, max = len.length; i < max; i++) {
            const el = len[i];
            if (data.current.tags[i].id !== el.id) {
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
              navigation.navigate(isEdit ? 'Details' : 'Home');
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
            <Text style={[styles.groupTitleText, { fontSize }]}>名称</Text>
            <Text style={[styles.warning, { fontSize: fontSize * .8 }]}>(必填)</Text>
          </View>
          <View style={styles.groupInput}>
            <InputView
              placeholder='点这里输入名称，例如微信、淘宝'
              onChangeText={update.bind(this, 'name')}
              defaultValue={data.current.name}
              autoFocus={!isEdit}
              maxLength={50}
            />
          </View>
        </View>
        <View>
          <View style={styles.groupTitle}>
            <Text style={[styles.groupTitleText, { fontSize }]}>账号</Text>
            <Text style={[styles.warning, { fontSize: fontSize * .8 }]}>(必填)</Text>
          </View>
          <View style={styles.groupInput}>
            <InputView
              placeholder='点这里输入账号'
              onChangeText={update.bind(this, 'account')}
              defaultValue={data.current.account}
              autoFocus={false}
              maxLength={128}
            />
          </View>
        </View>
        <View>
          <View style={styles.groupTitle}>
            <Text style={[styles.groupTitleText, { fontSize }]}>密码</Text>
          </View>
          <View style={styles.groupInput}>
            <InputView
              placeholder='点这里输入密码'
              onChangeText={update.bind(this, 'pwd')}
              defaultValue={data.current.pwd}
              autoFocus={false}
              maxLength={128}
            />
          </View>
        </View>
        <View>
          <View style={styles.groupTitle}>
            <Text style={[styles.groupTitleText, { fontSize }]}>标签</Text>
          </View>
          <View style={[styles.tagsWrap]}>
            <Tag mode='add' onPress={() => setAddFlag(true)}>
              新建标签
            </Tag>
            {
              newList.map((item, index) => (
                <Tag
                  key={index + ''}
                  activity={true}
                  onPress={(state, fn) => {
                    const list = [...newList];
                    list.splice(index, 1);
                    setNewList(list);
                  }}
                  icon={() => (
                    <Feather
                      name="x"
                      size={fontSize * .8}
                      color='#fff'
                      style={[styles.delIcon]}
                    />
                  )}
                >
                  {item}
                </Tag>
              ))
            }
            {tagList.map(item => {
              const isActive = data.current.tags.findIndex(_item => _item.id === item.id) !== -1;
              return (
                <Tag
                  key={item.id}
                  activity={isActive}
                  onPress={(state, fn) => {
                    if (state) {
                      data.current.tags.push(item);
                    } else {
                      // 操作后index会变化，实时计算，使用缓存信息会不准确
                      const delIndex = data.current.tags.findIndex(_item => _item.id === item.id);
                      delIndex !== -1 && data.current.tags.splice(delIndex, 1)
                    }
                    data.current.tags.sort((s1, s2) => (s1.index ?? 0) - (s2.index ?? 0));
                    fn(state);
                  }}
                >
                  {item.name}
                </Tag>
              );
            })}
          </View>
        </View>
        {/* {this.state.moreList.length ?
        <View>
          <View style={styles.groupTitle}>
            <Text>自定义添加项</Text>
          </View>
          <View>
            {this.state.moreList.map((item, index)=>{
              return this.renderItem(item, index);
            })}
          </View>
        </View>
        : null
      }
      <Button
        style={styles.more}
        onPress={this.addItem.bind(this)}
        underlayColor='#DEDEDE'
      >
        <Text style={styles.moreText}>添加更多</Text>
      </Button> */}
      </ScrollView>
      <ModalAdd
        visible={addFlag}
        onClose={data => {
          if (data?.val) {
            const list = [...newList];
            list.unshift(data.val);
            setNewList(list);
          }
          setAddFlag(false);
        }}
      />
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
  tagsWrap: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  delIcon: {
    marginLeft: 5,
  },
  // more: {
  // 	marginTop: 20,
  // 	marginBottom: 25,
  // 	paddingHorizontal: 15,
  // 	backgroundColor: '#fff',
  // 	height: 40,
  // 	justifyContent: 'center',
  // 	// alignItems: 'center',
  // },
  // moreText: {
  // 	color: '#586C94',
  // },
});
