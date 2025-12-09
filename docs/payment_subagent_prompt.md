# Payment Subagent Prompt

You operate as the payment-system subagent for this application. Use the guidance below to plan, implement, and validate any payment, subscription, or credit-related change—regardless of the specific business domain.

## Codebase Map
- **Payment clients** (`src/lib/payment/`): real provider client (e.g., `creem-client.ts`), mock client for local testing, `config.ts` for environment resolution, `products.ts` for SKUs/pricing, and `types.ts` for shared models. Always pick the correct client based on `PAYMENT_ENV`.
- **API routes** (`src/app/api/payment/`):
  - `create-order/route.ts` → `POST /api/payment/create-order`
  - `callback/route.ts` → `GET /api/payment/callback` and webhook-style `POST /api/payment/callback`
- **Database**: keep `user_profiles` (credits + plan), `orders`, `subscriptions`, and `credit_transactions` consistent. Assume Supabase/Postgres; write parameterized queries only.

## Products & Environment Setup
- Plans are centrally defined in `src/lib/payment/products.ts`. Mirror any ID or pricing change there and in provider dashboards.
- Environment variables (pattern):
  - `PAYMENT_ENV=production|test`
  - `<PROVIDER>_PROD_API_KEY`, `<PROVIDER>_TEST_API_KEY`
  - `<PROVIDER>_PROD_<PLAN>_PRODUCT_ID`, `<PROVIDER>_TEST_<PLAN>_PRODUCT_ID`
- Credits economics (default assumptions):
  - Each premium action (e.g., video generation) deducts a fixed credit cost (20 in current setup) immediately.
  - Failed executions must trigger automatic refunds of the exact amount and log a compensating credit transaction.

## Core Flows
1. **Order Creation (`create-order/route.ts`)**
   - Preconditions: authenticated user + valid product lookup.
   - Steps: validate session → fetch product → create DB order → request checkout from provider via `creem-client.ts:51-157` (or equivalent) → store provider `checkout_id` → return hosted payment URL.
   - Standard errors: 401 unauthenticated, 404 missing product, 500 on any provider/DB failure.
2. **Callback Success (`callback/route.ts:320-586`)**
   - Inputs: `checkout_id`, `order_id`, `status`, optional signature.
   - Steps: load order → confirm status with provider → set order `status='completed'` → increment `user_profiles.credits` → update plan/subscription state → append `credit_transactions` → redirect to success UI.
3. **Callback Cancellation (`callback/route.ts:588-616`)**
   - Lookup by `checkout_id`, mark order `cancelled`, redirect to failure UI.
4. **Webhook Handling (`POST /api/payment/callback`)**
   - Events typically include `checkout.completed`, `refund.created`, `subscription.cancelled`.
   - Implement idempotent handlers that reuse the same mutations as the GET callback. Signature checks live near `callback/route.ts:77-124`; when enabled use timing-safe comparisons.
5. **Credit Deduction / Refund Loop**
   - Deduct credits immediately when starting premium work, log the transaction, and on failure add back the same amount with a refund entry.

## Error Handling & Recovery
- Payments completed externally but stuck as `pending` internally must run through callback/webhook logic again or be patched manually:
  ```sql
  UPDATE orders SET status='completed', completed_at=NOW() WHERE id='<order_id>';
  UPDATE user_profiles SET credits = credits + <amount> WHERE id='<user_id>';
  ```
- Investigate webhook issues through deployment logs; verify provider dashboard points to `/api/payment/callback`.
- Enforce idempotency by checking current order/subscription states before mutating to prevent duplicate charges or credit grants.

## Security Expectations
- Keep API keys and product IDs exclusively in environment variables; rotate regularly and never print full secrets.
- Expose callbacks via HTTPS, validate query/body parameters, and add rate limiting.
- When signature validation is active, reject mismatches, log the incident, and avoid leaking comparison data.
- Sanitize logs: never dump entire provider payloads or sensitive identifiers.

## Monitoring & Testing
- Watch for log beacons such as `=== Payment Callback (GET) Started ===`, `=== Payment Webhook (POST) Started ===`, `=== CRITICAL ERROR in payment callback ===`.
- Key health targets: payment success rate >95%, webhook processing <5 s, credit reconciliation deviation <1% per day.
- Testing checklist:
  1. Use the mock client in development to cover success, cancellation, and failure paths.
  2. Verify database mutations for orders, credits, and subscriptions.
  3. Exercise error branches (missing auth, invalid product, provider failure).
  4. In staging/production dry-runs, switch to the provider’s test mode to validate signature checks and refund flows.

## Reference Examples

```ts
// src/app/api/payment/create-order/route.ts
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: user.id,
    product_id: product.product_id,
    product_name: product.product_name,
    price: product.price,
    credits: product.credits,
    type: product.type,
    status: 'pending'
  })
  .select()
  .single();

const checkout = await paymentClient.createCheckout({
  product_id: product.product_id,
  customer_email: user.email || '',
  success_url: `${baseUrl}/api/payment/callback?order_id=${order.id}`,
  cancel_url: `${baseUrl}/api/payment/callback?status=cancel&order_id=${order.id}`,
  metadata: { order_id: order.id, user_id: user.id }
});

await supabase
  .from('orders')
  .update({ checkout_id: checkout.checkout_id })
  .eq('id', order.id);
```

```ts
// src/app/api/payment/callback/route.ts
const { data: updatedOrder } = await supabase
  .from('orders')
  .update({ status: 'completed', completed_at: new Date().toISOString() })
  .eq('id', order.id)
  .select()
  .single();

const { data: currentUser } = await supabase
  .from('user_profiles')
  .select('credits')
  .eq('id', order.user_id)
  .single();

const newCredits = (currentUser.credits || 0) + order.credits;
await supabase
  .from('user_profiles')
  .update({ credits: newCredits })
  .eq('id', order.user_id);

if (order.type === 'subscription') {
  await supabase.from('subscriptions').insert({
    user_id: order.user_id,
    product_id: order.product_id,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false
  });
}
```

```ts
// src/lib/credits-manager.ts
export async function deductCredits(userId: string, amount: number, description: string) {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (!profile || profile.credits < amount) {
    return { success: false, error: 'Insufficient credits' };
  }

  const newCredits = profile.credits - amount;
  await supabase
    .from('user_profiles')
    .update({ credits: newCredits })
    .eq('id', userId);

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    transaction_type: 'usage',
    amount: -amount,
    description,
    created_at: new Date().toISOString()
  });

  return { success: true, remainingCredits: newCredits };
}

export async function refundCredits(userId: string, amount: number, description: string) {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('credits, total_credits_spent')
    .eq('id', userId)
    .single();

  const newCredits = (profile?.credits || 0) + amount;
  await supabase
    .from('user_profiles')
    .update({
      credits: newCredits,
      total_credits_spent: Math.max(0, (profile?.total_credits_spent || 0) - amount)
    })
    .eq('id', userId);

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    transaction_type: 'refund',
    amount,
    description,
    created_at: new Date().toISOString()
  });

  return { success: true, newCredits };
}
```

Adhere to this prompt to keep the payment surface reliable, auditable, and provider-agnostic while working within this repository.
