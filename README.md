![](https://github.com/xiek881028/kumaPwd/blob/master/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png)

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)

# kumaPwd

kumaPwd是app账号匣的项目源码。

项目基于react-naive开发，采用javascript编写，并非传统的java。其优势在于一次编写多端运行，一套代码可以同时生成android版和IOS版，降低开发成本。并且用户体验相比web app有着质的飞跃。但是因为作者没有IOS设备，以及因为IOS系统并没有文件管理器的概念，所以账号匣暂无IOS版。

> 可以使用ios的云端存储以及webdav支持账号匣，如果你有想法，欢迎PR，或者等作者有ios设备后再考虑。

尽管react-native有诸多优势，但其运行效率相比原生应用依旧有着一定的差距。加上目前react-native尚未发布正式版。账号匣开始开发时，react-native的版本仅为0.52.0。再加上作者是第一次使用react-native，所以账号匣必然有很多不完善的地方，希望各位能够谅解。

> 最新版react-native已更新至0.63.3

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
- 用命令行工具运行yarn。 ~~（请不要使用npm，在目前的版本中会导致bug）~~
- ~~如果您也是采用react-native 0.52.0构建的工程，在当前版本有几个已知bug需要您手动处理。~~
- - ~~项目采用的第三方图标库react-native-vector-icons在编译时会报错，需要删除./node_modules/react-native/local-cli/core/\_\_fixtures\_\_/files/package.json。~~
- - ~~目前的react-native的Modal组件表现有些不完美，需要更改./node_modules/react-native/Libraries/Modal/Modal.js里第217行的“white”为“transparent”。~~
- 将android下的gradle.properties.sample重命名为gradle.properties。
- ~~将src/assets/下的appCommonFn.js.sample重命名为appCommonFn.js。~~
- 将src/helper/crypto.js.sample重命名为crypto.js并实现加密核心方法。
- 运行npm run android项目即可启动。

## 目录说明

### android

android的根目录。包含后台进程监听、文件处理、指纹识别、文件分享、支付宝调用等模块

### photoShop_images

存放账号匣的设计文件，应用图标以及平台介绍图片

### src

kumaPwd核心代码

### index.js

项目入口

## 注意事项

账号匣的开源代码仅供个人学习使用，严禁用于其他非法用途。源码使用的开源协议为GPLv3，请悉知。

代码开源前进行了微调，出于安全考虑，删除了加密核心实现的代码。它位于src/helper/crypto.js，加密方法需要您自己实现。

目前账号匣开发的react-native版本是0.63.3，所以不排除用后续react-native版本构建项目时会导致项目无法运行（作者有时间时会对项目进行更新，尽量保证项目能在最新版react-naitve下正常运行）。

## 许可证（License）

[Anti-996 License](LICENSE)

> 从2.0.0版本开始，许可证（License）由 GPLv3 更改为 Anti-996，您仍可以遵守 GPLv3 协议使用v1版本
