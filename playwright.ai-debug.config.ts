import { defineConfig, devices } from '@playwright/test'
import defaultConfig from './playwright.config'

/**
 * AI 调试专用配置
 * 特点：
 * 1. 放慢测试执行速度
 * 2. 显示更详细的日志
 * 3. 自动打开浏览器开发者工具
 * 4. 保存所有的测试数据
 */
export default defineConfig({
  ...defaultConfig,
  use: {
    ...defaultConfig.use,
    // 放慢执行速度，方便观察
    launchOptions: {
      slowMo: 1000,
      devtools: true,
    },
    // 使用已经运行的开发服务器
    baseURL: 'http://localhost:5171',
    // 记录所有测试数据
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    // 自动保存 DOM 快照
    testIdAttribute: 'data-testid',
  },
  // 只使用 Chromium
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // 记录所有网络请求
        contextOptions: {
          logger: {
            isEnabled: () => true,
            log: (message, severity) => console.log(`[${severity}] ${message}`),
          },
        },
      },
    },
  ],
  // 更详细的报告
  reporter: [
    ['list', { printSteps: true }],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/ai-debug-report.json' }],
  ],
  // 保存更多测试数据
  preserveOutput: 'always',
  outputDir: 'test-results/ai-debug',
  // 使用开发服务器配置
  webServer: {
    command: 'npm run dev',
    port: 5171,
    reuseExistingServer: true,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
