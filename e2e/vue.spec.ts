import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('访问应用首页', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.app-header .title')).toHaveText('Jancy Template Vue')
})

test.describe('认证功能', () => {
  const testEmail = 'test@example.com'
  const testPassword = 'password123'

  test.beforeEach(async ({ page }) => {
    // 模拟 API 响应
    await page.route('**/api/auth/**', async (route) => {
      const url = route.request().url()
      let responseBody = {}

      if (url.includes('/register')) {
        responseBody = {
          success: true,
          response: {
            data: {
              token: 'fake-token',
              refreshToken: 'fake-refresh-token',
              user: {
                id: 1,
                email: testEmail,
                name: 'Test User',
              },
            },
          },
          message: '注册成功',
        }
      } else if (url.includes('/login')) {
        responseBody = {
          success: true,
          response: {
            data: {
              token: 'fake-token',
              refreshToken: 'fake-refresh-token',
              user: {
                id: 1,
                email: testEmail,
                name: 'Test User',
              },
            },
          },
          message: '登录成功',
        }
      } else if (url.includes('/logout')) {
        responseBody = {
          success: true,
          message: '已退出登录',
        }
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      })
    })

    await page.goto('/')
  })

  test('应该能够打开登录对话框', async ({ page }) => {
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page.locator('.el-dialog')).toBeVisible()
    await expect(page.locator('.el-dialog__title')).toHaveText('登录')
  })

  test('应该能够切换到注册模式', async ({ page }) => {
    await page.getByRole('button', { name: '登录' }).click()
    await page.locator('.switch-mode .el-link').click()
    await expect(page.locator('.el-dialog__title')).toHaveText('注册')
  })

  test('登录表单验证应该正常工作', async ({ page }) => {
    await page.getByRole('button', { name: '登录' }).click()
    await page.locator('.buttons .el-button--primary').click()
    await expect(page.locator('.el-form-item__error')).toHaveCount(2)

    await page.locator('input[type="email"]').fill('invalid-email')
    await page.locator('input[type="email"]').blur()
    await expect(page.getByText('请输入正确的邮箱格式', { exact: true })).toBeVisible()
  })

  test('注册表单验证应该正常工作', async ({ page }) => {
    await page.getByRole('button', { name: '注册' }).click()
    await page.locator('.buttons .el-button--primary').click()
    await expect(page.locator('.el-form-item__error')).toHaveCount(3)

    // 测试密码不匹配的情况
    await page.locator('input[type="email"]').fill(testEmail)
    await page.locator('input[type="password"]').first().fill(testPassword)
    await page
      .locator('input[type="password"]')
      .last()
      .fill(testPassword + '1')
    await page.locator('input[type="password"]').last().blur()
    await expect(page.getByText('两次输入的密码不一致', { exact: true })).toBeVisible()
  })

  test('完整的注册-登录-登出流程', async ({ page }) => {
    // 注册新用户
    await page.getByRole('button', { name: '注册' }).click()
    await page.locator('input[type="email"]').fill(testEmail)
    await page.locator('input[type="password"]').first().fill(testPassword)
    await page.locator('input[type="password"]').last().fill(testPassword)

    // 等待注册请求完成
    const registerPromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/register') && response.status() === 200,
    )
    await page.locator('.buttons .el-button--primary').click()
    const registerResponse = await registerPromise

    // 确保注册响应成功
    const registerData = await registerResponse.json()
    expect(registerData.success).toBe(true)

    // 等待对话框关闭
    await page.waitForFunction(
      () => {
        const dialog = document.querySelector('.el-dialog__wrapper') as HTMLElement
        return !dialog || window.getComputedStyle(dialog).display === 'none'
      },
      { timeout: 10000 },
    )

    // 验证注册成功，等待头像显示
    await expect(page.locator('.el-dropdown')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.el-dropdown .el-avatar')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.el-dropdown .el-avatar')).toHaveText('T')

    // 等待一下，确保状态已更新
    await page.waitForTimeout(2000)

    // 登出
    await page.locator('.el-dropdown').click()

    // 等待登出请求完成
    const logoutPromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/logout') && response.status() === 200,
    )
    await page.getByRole('menuitem', { name: '退出登录' }).click()
    const logoutResponse = await logoutPromise

    // 确保登出响应成功
    const logoutData = await logoutResponse.json()
    expect(logoutData.success).toBe(true)

    // 等待登出完成，确保登录按钮显示
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible({ timeout: 10000 })

    // 使用新注册的账户登录
    await page.getByRole('button', { name: '登录' }).click()
    await page.locator('input[type="email"]').fill(testEmail)
    await page.locator('input[type="password"]').fill(testPassword)

    // 等待登录请求完成
    const loginPromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.status() === 200,
    )
    await page.locator('.buttons .el-button--primary').click()
    const loginResponse = await loginPromise

    // 确保登录响应成功
    const loginData = await loginResponse.json()
    expect(loginData.success).toBe(true)

    // 等待对话框关闭
    await page.waitForFunction(
      () => {
        const dialog = document.querySelector('.el-dialog__wrapper') as HTMLElement
        return !dialog || window.getComputedStyle(dialog).display === 'none'
      },
      { timeout: 10000 },
    )

    // 验证登录成功，等待头像显示
    await expect(page.locator('.el-dropdown')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.el-dropdown .el-avatar')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.el-dropdown .el-avatar')).toHaveText('T')
  })
})
