# zack今天吃什么

一个用于多人饭局选择的静态网页原型。

## 功能

- 输入房间号进入房间
- 每个房间有独立菜品池
- 成员提交想吃和不想吃
- 结果池按想吃票数加权抽签
- 后台可查看、编辑、删除房间数据
- 可选 Supabase 云端同步，多人打开同一个 GitHub Pages 链接时共享房间数据

## 后台

访问 `index.html#admin`，密码为 `1`。

## 数据存储

默认状态下，数据保存在当前浏览器的 `localStorage`，每台设备互不共享。

填好 `config.js` 里的 Supabase 配置后，数据会同步到 Supabase 的 `app_state` 表里，所有人访问同一个网页会看到同一份房间、成员、菜品池和结果数据。浏览器仍会保留本地缓存，云端不可用时页面也能打开。

## 开启云端同步

1. 在 Supabase 创建一个项目。
2. 打开 Supabase SQL Editor，运行本项目的 `schema.sql`。
3. 在 Supabase Project Settings -> API 里复制 Project URL 和 anon public key。
4. 把它们填入 `config.js`：

```js
window.ZACK_EAT_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_ID.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

5. 提交并推送到 GitHub，GitHub Pages 会使用新的云端配置。

注意：这是朋友测试用的公开原型，前端密码和 anon key 都不是严格安全边界。不要存隐私数据；正式长期使用应改成登录用户和更细的数据库权限。
