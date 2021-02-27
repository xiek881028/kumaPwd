/*!
 * fixRnNodeify
 * xiekai <xk285985285@.qq.com>
 * create: 2017/11/30
 * update: 2017/12/11
 * since: 0.0.2
 * 修复rn-nodeify在循环node_modules下所有package.json时，因为方法bug，导致部分插件被遗漏的bug
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const argv = require('yargs').argv;
const file = require('kuma-helpers/node/file');
var extend = require('xtend/mutable');
var browser = require('rn-nodeify/browser.json');
var deepEqual = require('deep-equal');


function fixPackageJSON (modules, file, overwrite) {
  if (file.split(path.sep).indexOf('react-native') >= 0) return

  var contents = fs.readFileSync(path.resolve(file), { encoding: 'utf8' })

  // var browser = pick(baseBrowser, modules)
  var pkgJson
  try {
    pkgJson = JSON.parse(contents)
  } catch (err) {
    console.warn('failed to parse', file)
    return
  }

  // if (shims[pkgJson.name]) {
  //   log('skipping', pkgJson.name)
  //   return
  // }

  // if (pkgJson.name === 'readable-stream') debugger

  var orgBrowser = pkgJson['react-native'] || pkgJson.browser || pkgJson.browserify || {}
  if (typeof orgBrowser === 'string') {
    orgBrowser = {}
    orgBrowser[pkgJson.main || 'index.js'] = pkgJson['react-native'] || pkgJson.browser || pkgJson.browserify
  }

  var depBrowser = extend({}, orgBrowser)
  for (var p in browser) {
    if (modules.indexOf(p) === -1) continue

    if (!(p in orgBrowser)) {
      depBrowser[p] = browser[p]
    } else {
      if (!overwrite && orgBrowser[p] !== browser[p]) {
        log('not overwriting mapping', p, orgBrowser[p])
      } else {
        depBrowser[p] = browser[p]
      }
    }
  }

  modules.forEach(function (p) {
    if (depBrowser[p] === false && browser[p] !== false) {
      log('removing browser exclude', file, p)
      delete depBrowser[p]
    }
  })


  const { main } = pkgJson
  if (typeof main === 'string') {
    const alt = main.startsWith('./') ? main.slice(2) : './' + main
    if (depBrowser[alt]) {
      depBrowser[main] = depBrowser[alt]
      log(`normalized "main" browser mapping in ${pkgJson.name}, fixed here: https://github.com/facebook/metro-bundler/pull/3`)
      delete depBrowser[alt]
    }
  }

  if (pkgJson.name === 'constants-browserify') {
    // otherwise react-native packager chokes for some reason
    delete depBrowser.constants
  }

  if (!deepEqual(orgBrowser, depBrowser)) {
    pkgJson.browser = pkgJson['react-native'] = depBrowser
    delete pkgJson.browserify
    fs.writeFileSync(file, prettify(pkgJson))
  }
}

function log () {
  console.log.apply(console, arguments)
}

function prettify (json) {
  return JSON.stringify(json, null, 2) + '\n'
}

if (argv.init) {
  const rootPath = path.join(__dirname, '..', 'node_modules');
  const pkg = fs.readJsonSync(path.join(__dirname, '..', 'package.json'));
  const modules = Object.keys(pkg['react-native']);
  file(rootPath, {
    loop: true,
    exp: /package\.json$/g,
    json: false,
  }).map(item => {
    const obj = fs.readJsonSync(item);
    // 减少修改量，只有package.json里没有react-native的插件才进行修复
    if(obj['react-native'] === undefined) {
      fixPackageJSON(modules, item, true);
    }
    // fs.writeJsonSync(item, obj);
  });
}

process.exit();
