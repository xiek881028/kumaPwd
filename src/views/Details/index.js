import React, { useContext, useState, useCallback } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import style from '../../css/common.js';
import { decrypt } from '../../helper/crypto';
import { observer } from 'mobx-react';
import BasePage from '../../components/basePage';
import Tag from '../../components/tag';
import DetailsItem from './component/detailsItem';
import Button from '../../components/button';
import ModalDel from './component/modalDel';

export default observer(({ route, navigation }) => {
  const { params } = route;
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const { pwd: savePwd } = useContext(CTX_USER);
  const { cls, setListFn } = useContext(CTX_LIST);
  const { setTipsFn } = useContext(CTX_TIPS);
  const [modalFlag, setModalFlag] = useState(false);
  const [data, setData] = useState(cls.details(params.id));
  const [star, setStar] = useState(data.star);
  const createAccount = data => {
    return [
      {
        key: '账号',
        value: data.account || '',
      },
      {
        key: '密码',
        value: decrypt(data.pwd ?? '', savePwd) || '',
      }
    ];
  };
  useFocusEffect(
    // 每次到前台都获取最新数据，保证能够接收编辑的改动
    useCallback(() => {
      setData(cls.details(params.id));
    }, [])
  );
  return (
    <BasePage>
      <ScrollView style={style.container}>
        <View style={[styles.contentBox, styles.topContent]}>
          <View style={styles.detailsTitle}>
            <Text style={[styles.detailsTitleText, { fontSize: fontSize * 1.8 }]}>
              {data.name}
            </Text>
          </View>
          {
            createAccount(data).map((item, key) => (<DetailsItem key={key} data={item} />))
          }
        </View>
        {data.tags.length ? (
          <View style={[styles.contentBox]}>
            <View style={[styles.collection, styles.tagsWrap]}>
              <View
                style={styles.collectionTxtBox}
              >
                <Text style={[styles.collectionTitle, styles.tagsTitle, { fontSize }]}>标签</Text>
              </View>
              <View style={[styles.tagsList]}>
                {data.tags.map(item => (
                  <Tag activity={true} key={item.id}>
                    <Text>{item.name}</Text>
                  </Tag>
                ))}
              </View>
            </View>
          </View>
        ) : null}
        <Button
          mode='android'
          androidColor={backgroundColor}
          style={styles.contentBox}
          onPress={async () => { // 局部更新耗时在1~2ms范围内，全量更新耗时在20~40ms，优化有必要
            setStar(!star);
            await cls.toTop(data.id);
            setTipsFn('text', `${star ? '取消' : '加入'}收藏成功`);
            setListFn(cls.viewList);
          }}
        >
          <View style={styles.collection}>
            <View
              style={styles.collectionTxtBox}
            >
              <Text style={[styles.collectionTitle, { fontSize }]}>{star ? '已收藏' : '收藏'}</Text>
              <Text style={[styles.collectionCaption, { fontSize: fontSize * .8 }]}>收藏的账号会在列表中置顶显示</Text>
            </View>
            <FontAwesome
              name={star ? 'star' : 'star-o'}
              style={[styles.collectionIcon, { fontSize: fontSize * 1.6 }]}
            />
          </View>
        </Button>
        <Button
          mode='android'
          androidColor={backgroundColor}
          onPress={() => {
            navigation.navigate('EditAcount', { id: params.id, mode: 'edit' });
          }}
          underlayColor={backgroundColor}
          style={[styles.btnBox, { backgroundColor }]}
        >
          <Text style={[styles.btn, style.btnColor, { fontSize: fontSize * 1.125 }]}>编辑</Text>
        </Button>
        <Button
          mode='android'
          androidColor={backgroundColor}
          onPress={() => {
            setModalFlag(true);
          }}
          underlayColor={style.btnSubHeightBg.backgroundColor}
          style={[styles.btnBox, style.btnSubBg]}
        >
          <Text style={[styles.btn, style.btnSubColor, { fontSize: fontSize * 1.125 }]}>删除</Text>
        </Button>
      </ScrollView>
      <ModalDel
        visible={modalFlag}
        data={data}
        onClose={({ goBack }) => {
          setModalFlag(false);
          goBack && navigation.goBack();
        }}
      />
    </BasePage>
  );
});

const styles = StyleSheet.create({
  contentBox: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 3,
  },
  collection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  collectionTxtBox: {
    flex: 1,
    marginRight: 10,
    paddingLeft: 10,
  },
  collectionTitle: {
    paddingBottom: 5,
    color: '#353535',
  },
  collectionCaption: {
    color: '#999',
  },
  collectionIcon: {
    paddingRight: 10,
    color: '#ec971f',
  },
  topContent: {
    marginTop: 15,
    paddingTop: 15,
  },
  detailsTitle: {
    marginHorizontal: 10,
  },
  detailsTitleText: {
    lineHeight: 50,
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 10,
    color: '#353535',
  },
  btnBox: {
    marginHorizontal: 10,
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 3,
  },
  btn: {
    lineHeight: 46,
  },
  tagsWrap: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  tagsList: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    flexWrap: 'wrap',
  },
  tagsTitle: {
    paddingBottom: 0,
  },
});
