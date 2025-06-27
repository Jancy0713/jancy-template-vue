import { defineConfig, devices } from '@playwright/test'

/**
 * AI 调试专用配置
 * 特点：
 * 1. 放慢测试执行速度
 * 2. 显示更详细的日志
 * 3. 自动打开浏览器开发者工具
 * 4. 保存所有的测试数据
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['line'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${process.env.TEST_PORT || 6174}`,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run test:e2e:ai-server',
    url: `http://localhost:${process.env.TEST_PORT || 6174}`,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
