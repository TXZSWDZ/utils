# Utils

一个现代化的 TypeScript 工具库集合，提供常用的工具函数和实用方法。

## 项目简介

这是一个基于 TypeScript 开发的工具库集合，旨在提供高质量、类型安全的工具函数。项目使用 pnpm workspace 进行管理，支持 monorepo 结构，便于维护和扩展。

## 特性

- 🚀 基于 TypeScript，提供完整的类型支持
- 📦 使用 pnpm workspace 管理多包
- 🛠 支持 Vite 开发环境
- ✅ 包含完整的测试用例
- 🔍 使用 ESLint 进行代码规范检查
- 🏗 使用 Rollup 进行打包

## 安装

```bash
# 使用 pnpm 安装
pnpm add @wthe/utils

# 或使用 npm
npm install @wthe/utils

# 或使用 yarn
yarn add @wthe/utils
```

## 使用方法

```typescript
// 导入需要的工具函数
import { someUtil } from '@wthe/utils';

// 使用工具函数
const result = someUtil();
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:vite

# 运行测试
pnpm test

# 构建项目
pnpm build

# 代码检查
pnpm lint

# 修复代码问题
pnpm lint:fix
```

## 项目结构

```
.
├── packages/        # 工具包目录
├── playgrounds/     # 示例和测试目录
├── scripts/         # 构建脚本
└── ...
```

## 作者

- 作者：wang
- GitHub：[TXZSWDZ](https://github.com/TXZSWDZ)

## 许可证

ISC License
