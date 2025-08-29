# 推荐系统修复总结

## 问题描述
新用户通过邀请链接（如 `/auth/signup?ref=WAASPGC4`）注册后，发送邀请的用户没有产生一个pending的credit增加记录。

## 根本原因
1. **前端缺少处理**：SignupForm组件没有处理URL中的`ref`参数
2. **缺少连接点**：用户注册成功后没有调用推荐注册API
3. **数据库函数缺失**：缺少`increment_user_credits`函数

## 修复内容

### 1. 修复前端SignupForm组件
**文件**: `src/components/SignupForm.tsx`

**修改内容**:
- 添加了`useSearchParams`来获取URL中的`ref`参数
- 添加了`referralCode`状态来存储推荐码
- 添加了`handleReferralRegistration`函数来处理推荐注册
- 修改了`handleSubmit`函数，在注册成功后调用推荐注册API

**关键代码**:
```typescript
// 获取URL中的ref参数
useEffect(() => {
  const ref = searchParams.get('ref')
  if (ref) {
    setReferralCode(ref)
    console.log('Referral code found:', ref)
  }
}, [searchParams])

// 处理推荐注册
const handleReferralRegistration = async (userId: string) => {
  if (!referralCode) return

  try {
    const response = await fetch('/api/free-credits/referral/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode,
        newUserId: userId,
      }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('Referral registration successful:', result.data)
    } else {
      console.error('Referral registration failed:', result.error)
    }
  } catch (error) {
    console.error('Error calling referral registration API:', error)
  }
}
```

### 2. 修复AuthContext类型
**文件**: `src/contexts/AuthContext.tsx`

**修改内容**:
- 修改了`signUp`方法的返回类型，让它返回用户数据
- 这样前端可以在注册成功后获取用户ID

**关键代码**:
```typescript
signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null } }>

const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { error, data }
}
```

### 3. 添加数据库函数
**文件**: `database/free_credits_schema.sql`

**添加内容**:
- 添加了`increment_user_credits`函数用于增加用户积分

**关键代码**:
```sql
CREATE OR REPLACE FUNCTION public.increment_user_credits(
  user_id_param uuid,
  credit_amount integer
)
RETURNS void AS $$
BEGIN
  -- 更新用户积分
  UPDATE public.user_profiles 
  SET credits = credits + credit_amount,
      updated_at = now()
  WHERE id = user_id_param;
  
  -- 如果没有更新任何行，说明用户不存在
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 测试验证

### 测试脚本
创建了`scripts/test-complete-referral-flow.js`来验证修复效果。

### 测试结果
✅ 推荐流程测试成功：
- 推荐记录正确创建
- 推荐人积分正确增加（25 -> 30，+5积分）
- 积分交易记录正确创建
- 推荐状态正确更新为'credited'

## 工作流程

1. **用户访问邀请链接**: `/auth/signup?ref=WAASPGC4`
2. **前端获取推荐码**: SignupForm组件从URL中提取`ref`参数
3. **用户注册**: 用户填写表单并提交注册
4. **注册成功**: AuthContext返回用户数据
5. **调用推荐API**: 前端调用`/api/free-credits/referral/register`API
6. **后端处理**:
   - 验证推荐码有效性
   - 创建推荐记录
   - 更新推荐统计
   - 发放推荐奖励（5积分）
   - 记录积分交易
7. **完成**: 推荐人获得积分奖励

## 配置信息

### 推荐奖励配置
- **注册奖励**: 5积分
- **奖励类型**: registration
- **状态**: 激活

### 推荐码示例
- `WAASPGC4` (问题中提到的推荐码)
- `EB3DO4YC` (测试中使用的推荐码)

## 注意事项

1. **数据库函数**: 需要确保`increment_user_credits`函数在数据库中正确创建
2. **API权限**: 确保推荐注册API有正确的权限设置
3. **错误处理**: 前端包含了完整的错误处理逻辑
4. **日志记录**: 添加了详细的控制台日志用于调试

## 部署建议

1. 运行数据库迁移脚本添加`increment_user_credits`函数
2. 部署更新后的前端代码
3. 测试邀请链接功能
4. 监控推荐系统的运行状态

修复完成！现在新用户通过邀请链接注册后，推荐人将正确获得积分奖励。
