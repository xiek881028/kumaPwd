![](https://github.com/xiek881028/kumaPwd/blob/master/photoShop_images/kuma_icon.png)

[![License](https://img.shields.io/aur/license/yaourt.svg)](#)

# kumaPwd

kumaPwd是app账号匣的项目源码。

项目基于react-naive开发，采用javascript编写，并非传统的java。其优势在于一次编写多端运行，一套代码可以同时生成android版和IOS版，降低开发成本。并且用户体验相比web app有着质的飞跃。但是因为作者没有IOS设备，以及因为IOS系统并没有文件管理器的概念，所以账号匣暂无IOS版。

尽管react-native有诸多优势，但其运行效率相比原生应用依旧有着一定的差距。加上目前react-native尚未发布正式版。账号匣开始开发时，react-native的版本仅为0.52.0。再加上作者是第一次使用react-native，所以账号匣必然有很多不完善的地方，希望各位能够谅解。

如果您发现项目有bug，有好的建议或意见，可以在github上提issues给我，或者发邮件到xk285985285@qq.com。

下面将简单的介绍一下kumaPwd。

在开始阅读前，您应该对以下知识有基本的了解：

- HTML
- CSS
- JavaScript
- React
- React-Native
- Java

## 快速开始

- 请先自行搭建react-native运行环境。相关教程在网上有很多，比如[`React Native 中文网`](https://reactnative.cn/docs/0.51/getting-started.html)。
- clone项目源码到根目录。
- 用命令行工具运行yarn（请不要使用npm，在目前的版本中会导致bug）。
- 如果您也是采用react-native 0.52.0构建的工程，在当前版本有几个已知bug需要您手动处理。
- - 项目采用的第三方图标库react-native-vector-icons在编译时会报错，需要删除./node_modules/react-native/local-cli/core/\_\_fixtures\_\_/files/package.json。
- - 目前的react-native的Modal组件表现有些不完美，需要更改./node_modules/react-native/Libraries/Modal/Modal.js里第217行的“white”为“transparent”。
- 运行react-native run-android项目即可启动。

## 目录说明

简要的介绍几个主要目录及文件。

### android

android的根目录。写原生app的同学应该会目录很熟悉。这里主要存放了几个目前尚无法用js实现的功能。例如，备份功能所用的存储读取功能，捐助作者的调用支付宝功能，分享备份文件到第三方应用的分享功能（react-native目前的Share模块只支持分享文本）等等。

### photoShop_images

存放账号匣的设计文件，应用图标以及平台介绍图片。

### src

存放javascript源码。重点说明。

#### assets

资源文件，存放了获取账号名称拼音首字母功能的包以及app的公用方法。

#### components

存放二次封装的react-native公用组件。比如输入框组件、列表组件。
注意：路由配置router也在这个文件夹内。

#### css

公用css配置文件。

#### images

公用图片文件

#### NativeModules

javascript调用java包的配置文件。

#### views

页面视图文件。

#### App.js

根节点视图文件。

#### actions.js、actionTypes.js、reducers.js、store.js

4个文件均为redux配置文件。因为账号匣项目较小，代码量较小，所以文件没有进行拆分管理。

### index.js

工程入口文件。

## 注意事项

账号匣的开源代码仅供个人学习使用，严禁用于其他非法用途。源码使用的开源协议为GPLv3，请悉知。

代码开源前进行了微调，出于安全考虑，删除了密码加密部分的代码。它位于assets/appCommonFn.js，文件里的mathLoginPwd方法与mathDataPwd需要您自己实现。

因为账号匣开发时react-native版本是0.52.0，所以不排除用后续react-native版本构建项目时会导致项目无法运行（作者有时间时会对项目进行更新，尽量保证项目能在最新版react-naitve下正常运行）。

## 许可证（License）

GPLv3
