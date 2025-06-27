import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// 配置项
const CONFIG = {
  SERVER_START_TIMEOUT: 10000, // 服务器启动超时时间（毫秒）
  SERVER_PORTS: [6174, 6175, 6176, 6177, 6178], // 可能的服务器端口列表
  TEST_TIMEOUT: 300000, // 测试执行超时时间（5分钟）
  HEALTH_CHECK_INTERVAL: 1000, // 健康检查间隔（毫秒）
  MAX_RETRIES: 3, // 最大重试次数
  TEST_RETRY_COUNT: 2, // 测试重试次数
}

// 检查服务器是否就绪
async function checkServerReady() {
  for (const port of CONFIG.SERVER_PORTS) {
    try {
      const response = await fetch(`http://localhost:${port}`)
      if (response.status === 200) {
        CONFIG.ACTIVE_PORT = port // 记录实际使用的端口
        return true
      }
    } catch {
      continue
    }
  }
  return false
}

// 等待服务器就绪
async function waitForServer(timeout) {
  const startTime = Date.now()
  let retries = 0

  while (Date.now() - startTime < timeout) {
    if (await checkServerReady()) {
      console.log(`✅ 服务器已就绪 (端口: ${CONFIG.ACTIVE_PORT})`)
      return true
    }

    if (retries >= CONFIG.MAX_RETRIES) {
      console.log('❌ 服务器启动重试次数过多，退出程序')
      return false
    }

    retries++
    console.log(`⏳ 等待服务器就绪...（第 ${retries} 次尝试）`)
    await new Promise((resolve) => setTimeout(resolve, CONFIG.HEALTH_CHECK_INTERVAL))
  }

  console.error('❌ 服务器启动超时')
  return false
}

// 启动测试服务器
function startTestServer() {
  const server = spawn('npm', ['run', 'test:e2e:ai-server'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  })

  server.on('error', (error) => {
    console.error('❌ 服务器启动错误:', error)
    process.exit(1)
  })

  return server
}

// 运行E2E测试
function runE2ETests() {
  return new Promise((resolve, reject) => {
    let timeoutId

    const testProcess = spawn(
      'npx',
      [
        'cross-env',
        'PWDEBUG=console',
        'DEBUG=pw:api',
        'playwright',
        'test',
        '--config=playwright.ai-debug.config.ts',
        '--reporter=line',
        '--timeout=60000', // 增加单个测试超时时间到60秒
        `--retries=${CONFIG.TEST_RETRY_COUNT}`, // 添加重试次数
        '--workers=1', // 限制并发数量
        '--trace=on-first-retry', // 在首次重试时开启trace
      ],
      {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          TEST_PORT: CONFIG.ACTIVE_PORT, // 传递实际使用的端口给测试
        },
      },
    )

    // 设置整体测试超时
    timeoutId = setTimeout(() => {
      testProcess.kill()
      reject(new Error('测试执行超时'))
    }, CONFIG.TEST_TIMEOUT)

    testProcess.on('close', (code) => {
      clearTimeout(timeoutId)
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`测试失败，退出码: ${code}`))
      }
    })

    testProcess.on('error', (error) => {
      clearTimeout(timeoutId)
      reject(error)
    })
  })
}

// 启动测试报告服务器
function startReportServer() {
  const reportServer = spawn('npm', ['run', 'test:e2e:report'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  })

  reportServer.on('error', (error) => {
    console.error('❌ 报告服务器启动错误:', error)
  })

  return reportServer
}

// 清理进程
function cleanup(processes) {
  processes.forEach((process) => {
    if (process && !process.killed) {
      try {
        process.kill()
      } catch (error) {
        console.error('进程清理错误:', error)
      }
    }
  })
}

// 主函数
async function main() {
  const processes = []

  try {
    console.log('🚀 启动测试服务器...')
    const server = startTestServer()
    processes.push(server)

    // 等待服务器就绪
    const serverReady = await waitForServer(CONFIG.SERVER_START_TIMEOUT)
    if (!serverReady) {
      throw new Error('服务器启动失败')
    }

    console.log('🧪 开始运行E2E测试...')
    await runE2ETests()
    console.log('✅ E2E测试全部通过！')

    console.log('📊 启动测试报告服务器...')
    const reportServer = startReportServer()
    processes.push(reportServer)

    console.log('🌐 测试报告可在浏览器中查看')
    console.log('   报告地址: http://localhost:9323')

    console.log('\n📝 提示：')
    console.log('1. 测试报告服务器已启动')
    console.log('2. 使用 Ctrl+C 可以停止所有服务')
    console.log('3. 如果测试失败，可以在测试报告中查看详细信息')
    console
      .log('4. 重试记录和跟踪信息也可在报告中查看')

      [
        // 监听进程退出信号
        ('SIGINT', 'SIGTERM', 'SIGQUIT')
      ].forEach((signal) => {
        process.on(signal, () => {
          console.log('\n正在清理进程...')
          cleanup(processes)
          process.exit(0)
        })
      })
  } catch (error) {
    console.error('❌ 错误:', error.message)
    cleanup(processes)
    process.exit(1)
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  process.exit(1)
})

main().catch((error) => {
  console.error('❌ 程序执行错误:', error)
  process.exit(1)
})
