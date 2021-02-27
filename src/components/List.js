import React, { useRef, useEffect, useContext, memo } from 'react';
import {
	StyleSheet,
	Text,
	View,
	SectionList,
	KeyboardAvoidingView,
	// Keyboard,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { observer } from 'mobx-react';
import ListContext, { CtxList } from './listContext';
import ListScrollView from './listScrollView';
import ListModalCenter from './listModalCenter';
import Button from './button';

const ListItem = observer(({ isSearch, item, searchKey, onPress, prefix, index }) => {
	const { fontSize, backgroundColor } = useContext(CTX_THEME);
	// 高亮搜索匹配文字
	const renderSearch = (str, styles = {}, key) => {
		if (!key) {
			return (
				<Text {...styles}>
					{str}
				</Text>
			);
		} else {
			let items = [];
			let split = str.split(key);
			for (let i = 0, max = split.length; i < max; i++) {
				split[i] != '' && items.push(split[i]);
				i != max - 1 && items.push(
					<Text key={i} style={{ color: '#ff5053' }}>{key}</Text>
				);
			}
			return (
				<Text {...styles}>
					{items}
				</Text>
			);
		}
	}
	return (
		<Button
			mode='android'
			androidColor={backgroundColor}
			onPress={() => {
				onPress({
					data: item,
					isSearch,
					searchKey,
					index,
				});
			}}
			underlayColor={backgroundColor}
			style={styles.itemWrap}
		>
			<>
				{(prefix ?? (() => { }))(item)}
				{renderSearch(item.name, { style: [styles.itemName, isSearch ? styles.itemNameInSearch : '', { fontSize }], numberOfLines: 1 }, searchKey)}
				{isSearch ?
					renderSearch(item.account, { style: [styles.itemAccount, { fontSize }], numberOfLines: 1 }, searchKey)
					: null
				}
			</>
		</Button>
	);
});

const ListItemHead = observer(({ section }) => {
	const { fontSize } = useContext(CTX_THEME);
	return section.key === '__options' ? null : (
		<View style={styles.headBox}>
			{section.key == 'like' ?
				<FontAwesome
					style={[styles.headItem, { fontSize: fontSize * .7 }]}
					name='star'
				/>
				:
				<Text style={[styles.headItem, { fontSize: fontSize * .7 }]}>{section.key}</Text>
			}
		</View>
	);
});

const ListOpsItem = observer(({ item }) => {
	const { fontSize, backgroundColor } = useContext(CTX_THEME);
	return (
		<Button
			mode='android'
			androidColor={backgroundColor}
			onPress={item.onPress ?? (() => { })}
			underlayColor={backgroundColor}
			style={[styles.itemWrap, styles.itemOpsWrap]}
		>
			{item.icon}
			<Text style={[styles.itemOpsText, { fontSize }]}>{item.name}</Text>
		</Button>
	);
});

const List = memo(observer(({ sections, isSearch = false, options = false, searchKey, onPress, prefix, height, ...other }) => {
	const { fontSize } = useContext(CTX_THEME);
	const listRef = useRef(null);
	const keyObj = useRef({});
	const { active } = useContext(CtxList);
	// 按照官方优化建议，renderItem不要是匿名方法，减少渲染成本
	const renderItem = useRef(({ item, section, index }) => {
		return options && section.key === '__options' ?
			<ListOpsItem
				item={item}
			/>
			:
			<ListItem
				isSearch={isSearch}
				item={item}
				searchKey={searchKey}
				onPress={onPress ?? (() => { })}
				prefix={prefix}
				index={index}
			/>;
	});
	useEffect(() => {
		keyObj.current = {};
		Object.keys(sections).map((item, index) => {
			keyObj.current[sections[item].key] = index;
		});
	}, [sections]);
	useEffect(() => {
		const index = keyObj.current[active];
		if (index !== undefined) {
			listRef.current.scrollToLocation({
				itemIndex: 0,
				sectionIndex: index,
				animated: false,
			});
		}
	}, [active]);
	return (
		<KeyboardAvoidingView style={styles.wrap}>
			<SectionList
				style={styles.list}
				ref={listRef}
				// 拖拽视图隐藏键盘
				keyboardDismissMode='on-drag'
				// 点击列表后隐藏软键盘
				keyboardShouldPersistTaps='handled'
				renderItem={renderItem.current}
				renderSectionHeader={({ section }) => <ListItemHead section={section} />}
				ItemSeparatorComponent={() => <View style={styles.border}></View>}
				initialNumToRender={20}
				getItemLayout={(data, index) => {
					// 必须，否则scrollToLocation滚动到位于外部渲染区的位置会报错
					return {length: 60, offset: 1 * index, index};
				}}
				// ref='sectionList'
				keyExtractor={(item, index) => {
					return index.toString();
				}}
				sections={sections}
				// 顶部粘连
				stickySectionHeadersEnabled={true}
				ListFooterComponent={() => {
					return (
						sections.length ?
							<View style={styles.bottomPad}>
								<Text
									style={[styles.bottomPadText, { fontSize: fontSize * .9 }]}
								>我是有底线的</Text>
								<View
									style={styles.bottomPadBorder}
								></View>
							</View>
							: null
					);
				}}
				{...other}
			></SectionList>
			{
				sections.length ?
					<>
						<ListScrollView options={options} height={height} />
						<ListModalCenter />
					</>
					: null
			}
		</KeyboardAvoidingView>
	);
}));

export default props => {
	return (
		<ListContext>
			<List {...props} />
		</ListContext>
	);
};

const styles = StyleSheet.create({
	wrap: {
		flex: 1,
	},
	itemWrap: {
		flexDirection: 'row',
		height: 60,
		backgroundColor: '#fff',
	},
	itemOpsText: {
		color: '#353535',
	},
	itemOpsWrap: {
		alignItems: 'center',
		flex: 1,
		paddingHorizontal: 15,
	},
	itemName: {
		textAlignVertical: 'center',
		flex: 1,
		minWidth: 120,
		paddingLeft: 15,
		paddingRight: 25,
		color: '#353535',
	},
	itemNameInSearch: {
		flex: 0,
		width: '40%',
	},
	itemAccount: {
		textAlignVertical: 'center',
		color: '#666',
		paddingHorizontal: 20,
		width: '55%',
	},
	headBox: {
		backgroundColor: '#ebebeb',
	},
	headItem: {
		textAlignVertical: 'center',
		// borderWidth: 1,
		height: 24,
		paddingHorizontal: 15,
		color: '#888',
	},
	list: {
		backgroundColor: '#ebebeb',
		flex: 1,
	},
	border: {
		marginHorizontal: 10,
		height: 1,
		backgroundColor: '#eee',
	},
	bottomPad: {
		alignItems: 'center',
	},
	bottomPadText: {
		lineHeight: 40,
		paddingTop: 10,
		paddingHorizontal: 10,
		zIndex: 2,
		backgroundColor: '#ebebeb',
	},
	bottomPadBorder: {
		height: 1,
		backgroundColor: '#999',
		position: 'absolute',
		top: 30,
		left: 25,
		right: 25,
	},
});
