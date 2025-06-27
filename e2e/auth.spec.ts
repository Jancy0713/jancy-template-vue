import { test, expect } from '@playwright/test'

test.describe('认证功能测试', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!@#',
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('基础 UI 交互测试', async ({ page }) => {
    // 1. 测试登录对话框
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page.locator('.el-dialog')).toBeVisible()
    await expect(page.locator('.el-dialog__title')).toHaveText('登录')

    // 2. 测试切换到注册模式
    await page.locator('.switch-mode .el-link').click()
    await expect(page.locator('.el-dialog__title')).toHaveText('注册')

    // 3. 测试表单验证
    await page.locator('.buttons .el-button--primary').click()
    await expect(page.locator('.el-form-item__error')).toHaveCount(3)

    // 4. 测试邮箱格式验证
    await page.getByLabel('邮箱').fill('invalid-email')
    await page.getByLabel('邮箱').blur()
    await expect(page.getByText('请输入正确的邮箱格式')).toBeVisible()

    // 5. 测试密码匹配验证
    const passwordInputs = await page.locator('input[type="password"]').all()
    await passwordInputs[0].fill('password123') // 第一个为密码
    await passwordInputs[1].fill('password456') // 第二个为确认密码
    await passwordInputs[1].blur()
    await expect(page.getByText('两次输入的密码不一致')).toBeVisible()
  })

  test('完整的注册-登录-登出-注销流程', async ({ page }) => {
    // 1. 注册新用户
    await page.getByRole('button', { name: '注册' }).click()
    await page.getByLabel('邮箱').fill(testUser.email)
    const passwordInputs = await page.locator('input[type="password"]').all()
    await passwordInputs[0].fill(testUser.password)
    await passwordInputs[1].fill(testUser.password)
    // 只点击弹窗内的注册按钮
    await page.locator('.el-dialog .buttons .el-button--primary').click()

    // 验证注册成功（如无 toast，可断言邮箱出现）
    await expect(page.getByText(testUser.email)).toBeVisible({ timeout: 10000 })

    // 2. 退出登录
    await page.getByRole('img', { name: testUser.email.charAt(0).toUpperCase() }).click()
    await page.getByRole('menuitem', { name: '退出登录' }).click()
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()

    // 3. 使用新账号登录
    await page.getByRole('button', { name: '登录' }).click()
    await page.getByLabel('邮箱').fill(testUser.email)
    await page.locator('input[type="password"]').first().fill(testUser.password)
    await page.locator('.el-dialog .buttons .el-button--primary').click()

    // 验证登录成功（如无 toast，可断言邮箱出现）
    await expect(page.getByText(testUser.email)).toBeVisible({ timeout: 10000 })

    // 4. 注销账号
    await page.getByRole('img', { name: testUser.email.charAt(0).toUpperCase() }).click()
    await page.getByRole('menuitem', { name: '退出登录' }).click()
    await page.getByRole('button', { name: '登录' }).click()
    await page.locator('input[type="password"]').first().fill(testUser.password)
    await page.getByLabel('请输入 "DELETE MY ACCOUNT" 确认注销').fill('DELETE MY ACCOUNT')
    await page.getByRole('link', { name: '注销' }).click()
    await page.getByRole('button', { name: '注销' }).click()

    // 验证注销成功（如无 toast，可断言登录按钮出现）
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
  })

  test('默认账号登录和保护测试', async ({ page }) => {
    // 1. 登录默认账号
    await page.getByRole('button', { name: '登录' }).click()
    await page.getByLabel('邮箱').fill('admin@example.com')
    await page.locator('input[type="password"]').first().fill('admin123')
    await page.locator('.el-dialog .buttons .el-button--primary').click()

    // 验证登录成功（如无 toast，可断言邮箱出现）
    await expect(page.getByText('admin@example.com')).toBeVisible({ timeout: 10000 })

    // 2. 尝试注销默认账号（应该被阻止）
    await page.getByRole('img', { name: 'a' }).click()
    await page.getByRole('menuitem', { name: '退出登录' }).click()
    await page.getByRole('button', { name: '登录' }).click()
    await page.locator('input[type="password"]').first().fill('admin123')
    await page.getByLabel('请输入 "DELETE MY ACCOUNT" 确认注销').fill('DELETE MY ACCOUNT')
    await page.getByRole('link', { name: '注销' }).click()
    await page.getByRole('button', { name: '注销' }).click()

    // 验证注销被阻止
    await expect(page.getByText('Cannot delete default test accounts')).toBeVisible()
  })
})
