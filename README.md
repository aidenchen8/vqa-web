# VQA Annotation System

This is a VAQ annotation system used for V2X roadside data labeling.

## Install

- make sure you have install node.js v20+

```sh
# install pnpm
npm i pnpm -g

# enable corepack
corepack enable

# install packages
pnpm i
```

## Architecture

### Front-end

Vue3 + vite

```sh
# 启动开发
pnpm dev
# 构建
pnpm build
# 预览
pnpm preview
```

### Back-end

express + mongodb

```sh
# mac 端启动 mongodb （需提前安装）
mongod --dbpath /Library/mongodb/data --logpath /Library/mongodb/log/mongod.log --logappend --fork

# 启动服务
pnpm serve
```
