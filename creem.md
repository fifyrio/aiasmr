# Creem Checkout Session 简介

[官方文档链接](https://docs.creem.io/learn/checkout-session/introduction)

Creem 支持通过 API 动态创建 Checkout Session，方便你在每次支付前为用户生成专属的支付链接，并能追踪每一笔交易的状态与来源。

---

## 📌 基础概念

Checkout Session 是用户发起支付前的会话凭据，用于生成一个临时的支付链接。相比固定的 Payment Link，Checkout Session 提供更高的灵活性和安全性。

---

## 🚀 创建一个 Checkout Session

你可以使用任意语言或工具（如 cURL、Axios）调用 Creem 的 Checkout API 来创建 Session。

### 示例：Axios (JavaScript)

```js
const response = await axios.post(
  "https://api.creem.io/v1/checkouts",
  {
    product_id: "prod_6tW66i0oZM7w1qXReHJrwg",
    request_id: "req_001",
  },
  {
    headers: {
      "x-api-key": "creem_123456789"
    }
  }
);

🧩 可选参数详解

✅ request_id
类型：string
用途：为每一次 Checkout 唯一标记请求来源。建议你使用自己系统中的 ID 来追踪用户和订单。
✅ metadata
类型：object
用途：用于传递额外信息，如用户 ID、营销来源、utm 参数等。
示例：
"metadata": {
  "userId": "user_123456",
  "source": "landing_page",
  "campaign": "summer_sale"
}
注意：这些字段会保存在用户的 subscription 中，并通过 webhook 一并传回。
✅ success_url
类型：string
用途：用户支付成功后跳转的地址。
示例：
"success_url": "https://yourdomain.com/payment-success"
特性：
Creem 会自动附加如下参数到 URL：
?session_id=...&product_id=...&status=success&request_id=...
并且通过签名认证以防篡改（详见 Webhook 验证）。
✅ customer.email
类型：string
用途：为当前 Checkout Session 绑定邮箱地址，并锁定输入框。
示例：
"customer": {
  "email": "user@example.com"
}
特性：
适用于账号系统中已知用户，防止用户修改邮箱导致数据错乱。
✅ discount_code
类型：string
用途：预填折扣码字段，自动应用优惠。
示例：
"discount_code": "SUMMER2025"
特性：
可用于自定义推广活动或会员激励。
✅ units
类型：integer
用途：指定购买单位数，系统将以单位价格 × units 计算总价。
示例：
"units": 3
使用场景：
购买多个席位、积分包、视频生成次数等。
✅ locale
类型：string
用途：设置支付页的默认语言。
示例：
"locale": "zh-CN"
支持的语言包括：en, zh-CN, fr, es, 等（详见 API 文档）。
✅ plan_type
类型：string
用途：用于标记计划类型（非必须，仅用于你系统的标识）。
示例：
"plan_type": "team_annual"
✅ 最终示例请求体

{
  "product_id": "prod_6tW66i0oZM7w1qXReHJrwg",
  "request_id": "order_8899",
  "success_url": "https://yourdomain.com/success",
  "customer": {
    "email": "hello@example.com"
  },
  "metadata": {
    "utm_source": "twitter",
    "referrer": "aff_003"
  },
  "discount_code": "NEWUSER20",
  "units": 5,
  "locale": "zh-CN"
}
