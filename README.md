# dsh-knj-menu

第三方菜单管理器（DeepSeek Harness 插件）

统一收纳第三方插件新增的菜单入口，提供常驻 / 折叠 + 📌 固定。

## 功能

- 收集第三方插件通过 `dsh.bundle` 声明的菜单入口
- 常驻模式：菜单始终显示
- 折叠模式：收起为图标，点击展开
- 📌 固定：常用菜单置顶，不随折叠隐藏

## 安装

```sh
dsh plugin --profile web add dsh-knj-menu
```

## 要求

- `dsh web` >= 0.1.0-rc.6

## License

MIT
