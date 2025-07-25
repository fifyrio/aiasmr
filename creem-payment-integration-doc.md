# Creem.io 支付集成文档

## 概述

该项目是一个AI发型设计应用，使用Creem.io作为支付服务提供商来处理用户的付费功能。系统支持积分购买和订阅服务两种付费模式。

## 技术架构

### 核心组件

- **支付客户端**: `app/.server/libs/creem/client.ts`
- **支付服务**: `app/.server/services/order.ts` 
- **回调处理**: `app/routes/_callback/payment/route.ts`
- **Webhook处理**: `app/routes/_webhooks/payment/route.ts`
- **订单创建**: `app/routes/_api/create-order/route.ts`

### 配置文件

配置信息存储在 `wrangler.jsonc:36-38`:
```json
"CREEM_KEY": "creem_xxxxxxxxxx",
"CREEM_TEST_KEY": "creem_test_xxxxxxxxxx", 
"CREEM_WEBHOOK_SECRET": "xxxxxxxxxxx"
```

## 支付流程

### 1. 创建订单流程

**入口**: `/app/routes/_api/create-order/route.ts:9`

1. 用户选择产品并发起付费请求
2. 系统验证用户身份和产品有效性
3. 调用 `createOrder` 函数创建本地订单记录
4. 调用 Creem API 创建 checkout 会话
5. 返回支付链接给前端

**核心代码**:
```typescript
// app/routes/_api/create-order/route.ts:19-28
const result = await createOrder(
  {
    credits: product.credits,
    price: product.price,
    product_id: product.product_id,
    product_name: product.product_name,
    type: product.type,
  },
  user
);
```

### 2. 支付完成处理

**入口**: `/app/routes/_callback/payment/route.ts:7`

1. 用户完成支付后，Creem重定向到回调URL
2. 系统验证回调签名确保请求合法性  
3. 调用 `handleOrderComplete` 处理订单完成逻辑
4. 重定向用户到主页

**签名验证**:
```typescript
// app/routes/_callback/payment/route.ts:14-21
const { signature: creemSignature, ...rest } = paramsRecord;
const creem = createCreem();
const signature = creem.createCallbackSignature(rest);

if (creemSignature !== signature) {
  throw Error("Unvalid Signature");
}
```

### 3. Webhook事件处理

**入口**: `/app/routes/_webhooks/payment/route.ts:10`

支持的事件类型:
- `checkout.completed`: 支付完成
- `refund.created`: 退款创建

**事件处理**:
```typescript
// app/routes/_webhooks/payment/route.ts:25-35
const { eventType, ...rest } = JSON.parse(body) as WebhookBody;

if (eventType === "checkout.completed") {
  const checkout = rest.object as Checkout;
  await handleOrderComplete(checkout.id);
} else if (eventType === "refund.created") {
  const v = rest.object as Refund;
  const { checkout } = v;
  await handleOrderRefund(checkout.id);
}
```

## Creem客户端实现

### 客户端初始化

**文件**: `app/.server/libs/creem/index.ts:4`

```typescript
export const createCreem = () => {
  let client: CreemApiClient;
  if (import.meta.env.PROD) client = new CreemApiClient();
  else {
    client = new CreemApiClient(
      "https://test-api.creem.io",
      env.CREEM_TEST_KEY
    );
  }
  return client;
};
```

### 核心功能

**API客户端**: `app/.server/libs/creem/client.ts:16`

主要方法:
- `createCheckout()`: 创建支付会话
- `getCheckout()`: 获取支付会话信息  
- `createCallbackSignature()`: 创建回调签名
- `createWebhookSignature()`: 创建Webhook签名
- `verifyWebhookSignature()`: 验证Webhook签名

## 业务逻辑处理

### 订单完成处理

**函数**: `app/.server/services/order.ts:78`

处理逻辑:
1. 验证checkout状态
2. 查找对应的本地订单
3. 更新订单状态为processing
4. 根据订单类型处理:
   - **一次性购买**: 添加积分到用户账户
   - **订阅购买**: 创建订阅记录并添加积分

### 退款处理

**函数**: `app/.server/services/order.ts:172`

处理逻辑:
1. 取消相关订阅
2. 清零剩余积分
3. 记录积分消费
4. 更新订单状态为已退款

## 产品配置

### 积分包产品

**文件**: `app/.server/constants/product.ts:9`

```typescript
export const CREDITS_PRODUCT: PRODUCT = {
  price: 9,
  credits: 100,
  product_id: import.meta.env.PROD
    ? "prod_3q2PT9pqzfw5URK7TdIhyb"
    : "prod_tMa1e6wOR5SnpYzLKUVaP",
  product_name: "Credits Pack",
  type: "once",
};
```

### 订阅计划

**文件**: `app/.server/constants/pricing.ts:19`

支持月订阅和年订阅，包含以下特性:
- 去广告体验
- 无水印图片
- 高分辨率输出
- 完整风格库
- 每月积分赠送
- 私有化生成

## 安全机制

### 签名验证

1. **回调签名**: 使用SHA256算法验证支付回调的真实性
2. **Webhook签名**: 使用HMAC-SHA256验证Webhook请求
3. **时间安全**: 使用 `crypto.timingSafeEqual()` 防止时序攻击

### 数据类型定义

**文件**: `app/.server/libs/creem/types.ts`

定义了完整的Creem API数据结构:
- Order: 订单信息
- Product: 产品信息  
- Customer: 客户信息
- Subscription: 订阅信息
- Checkout: 支付会话信息
- WebhookBody: Webhook事件体
- Refund: 退款信息

## 环境配置

### 开发环境
- API地址: `https://test-api.creem.io`
- 使用测试密钥: `CREEM_TEST_KEY`

### 生产环境  
- API地址: `https://api.creem.io`
- 使用正式密钥: `CREEM_KEY`

## 部署说明

项目部署在Cloudflare Workers上，配置文件为 `wrangler.jsonc`。需要配置以下环境变量:

- `CREEM_KEY`: 生产环境API密钥
- `CREEM_TEST_KEY`: 测试环境API密钥  
- `CREEM_WEBHOOK_SECRET`: Webhook签名密钥
- `DOMAIN`: 部署域名，用于构建回调URL

## 总结

该项目通过Creem.io实现了完整的支付功能，包括:
- 支持一次性购买和订阅模式
- 完整的支付流程处理
- 安全的签名验证机制
- 灵活的产品配置
- 完善的退款处理
- 基于Cloudflare Workers的无服务器架构

系统设计合理，代码结构清晰，具有良好的可维护性和扩展性。