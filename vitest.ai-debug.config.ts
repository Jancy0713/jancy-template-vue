import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig({
  ...viteConfig,
  test: {
    // 显示所有测试用例的详细信息
    testTimeout: 30000, // 设置合理的超时时间
    poolOptions: {
      threads: {
        singleThread: true, // 单线程执行，便于调试
      },
    },
    // 详细的测试报告
    reporters: ['default', 'verbose'],
    // 保存测试覆盖率报告
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-results/unit/coverage',
      all: true,
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.d.ts', 'src/**/types/**', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    },
    // 详细的快照信息
    snapshotFormat: {
      printBasicPrototype: true,
      escapeString: false,
    },
    // 启用所有的控制台输出
    silent: false,
    logHeapUsage: true, // 添加堆内存使用情况日志
    sequence: {
      shuffle: false, // 禁用随机测试顺序
    },
    globals: true, // 启用全局变量
    environment: 'jsdom', // 使用 jsdom 环境
  },
})
