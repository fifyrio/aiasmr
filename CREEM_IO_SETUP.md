# Creem.io 支付回调配置指南

## 🔧 必须在 Creem.io 后台设置的回调URL

### 测试环境
```
回调URL: http://localhost:3000/api/payment/callback
Webhook URL: http://localhost:3000/api/payment/callback
```

### 生产环境
```
回调URL: https://www.aiasmr.vip/api/payment/callback
Webhook URL: https://www.aiasmr.vip/api/payment/callback
```

## 📋 回调URL参数说明

我们的系统支持以下回调参数：

### GET 回调 (用户支付完成后重定向)
- `checkout_id`: Creem.io 生成的结账ID
- `status`: 支付状态 (`success`, `cancel`, `cancelled`)
- `order_id`: 我们系统的订单ID
- `signature`: 签名验证参数

示例：
```
http://localhost:3000/api/payment/callback?checkout_id=co_123&status=success&order_id=456&signature=abc123
```

### POST Webhook (Creem.io 服务端通知)
支持的事件类型：
- `checkout.completed`: 支付完成
- `refund.created`: 退款创建
- `subscription.cancelled`: 订阅取消

## 🔐 签名验证

系统使用 HMAC-SHA256 验证回调签名，使用环境变量 `CREEM_WEBHOOK_SECRET`。

## 🏗️ 数据库更新流程

支付成功后系统会自动：

1. **更新订单状态** - 设置为 `completed`
2. **增加用户Credit** - 根据产品配置增加积分
3. **更新用户计划类型** - 设置 `plan_type` (trial/basic/pro)
4. **创建订阅记录** - 对于订阅类型产品
5. **记录交易日志** - 添加到 `credit_transactions` 表

## 🧪 测试和调试

### 调试页面
- 用户状态: `/debug-user-status`
- 支付配置: `/debug-payment`

### 手动刷新用户状态
```javascript
POST /api/user/refresh-status
```

## 🎯 产品ID映射

### 测试环境
- Trial: `prod_4U52gw2XCmcajBDwu6Ru6G`
- Basic: `prod_2Gj8BYSJ8CPf7AtK9RqtUy`
- Pro: `prod_6AmUBfwn7nqjKo6wh4K8U3`

### 生产环境
- Trial: `prod_4oJ0n9ZOU0x2Tn9rQ1oDJ5`
- Basic: `prod_4oJ0n9ZOU0x2Tn9rQ1oDJ5`
- Pro: `prod_5H9ctZ7GUs425KayUilncU`

## ⚙️ 环境变量配置

确保以下环境变量正确设置：

```bash
# 环境切换
PAYMENT_ENV=test  # 或 production

# 测试环境
CREEM_TEST_API_KEY=creem_test_1v0DHMdAvPt08yxktLnZBC
CREEM_TEST_TRIAL_PRODUCT_ID=prod_4U52gw2XCmcajBDwu6Ru6G
CREEM_TEST_BASIC_PRODUCT_ID=prod_2Gj8BYSJ8CPf7AtK9RqtUy
CREEM_TEST_PRO_PRODUCT_ID=prod_6AmUBfwn7nqjKo6wh4K8U3

# 生产环境
CREEM_PROD_API_KEY=34a0b952eece6d8b00730360b0ebed3f
CREEM_PROD_TRIAL_PRODUCT_ID=prod_4oJ0n9ZOU0x2Tn9rQ1oDJ5
CREEM_PROD_BASIC_PRODUCT_ID=prod_4oJ0n9ZOU0x2Tn9rQ1oDJ5
CREEM_PROD_PRO_PRODUCT_ID=prod_5H9ctZ7GUs425KayUilncU

# Webhook密钥
CREEM_WEBHOOK_SECRET=your_webhook_secret_here
```

## 🚨 故障排除

### 支付成功但Credit未更新
1. 检查 Creem.io 后台是否正确设置了回调URL
2. 查看服务器日志确认回调是否被接收
3. 检查 `CREEM_WEBHOOK_SECRET` 是否正确设置
4. 使用 `/debug-user-status` 页面检查用户状态

### 用户看不到订阅计划名称
1. 确认支付回调正确更新了 `user_profiles.plan_type`
2. 检查 `useSubscription` hook 是否正常工作
3. 验证产品名称映射逻辑

### 支付后未跳转回网站
1. 确认 Creem.io 后台设置了正确的回调URL
2. 检查回调URL是否可访问（测试环境需要内网穿透）
3. 查看浏览器网络请求确认回调是否成功