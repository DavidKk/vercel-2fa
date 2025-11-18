import { defineConfig, devices } from '@playwright/test'

/**
 * 阅读 https://playwright.dev/docs/test-configuration 了解更多信息
 */
export default defineConfig({
  testDir: './__webtests__',
  /* TypeScript 配置 */
  // 使用专门的 TypeScript 配置文件
  // @ts-ignore
  // Playwright 会自动查找 tsconfig.json，但我们可以通过环境变量指定
  /* 并行运行测试的最大数量 */
  fullyParallel: true,
  /* 如果测试失败，在 CI 中重试 */
  retries: process.env.CI ? 2 : 0,
  /* 在 CI 中禁用并行执行 */
  workers: process.env.CI ? 1 : undefined,
  /* 测试报告配置 */
  // 使用 list reporter 在控制台输出详细结果，适合 CI/CD
  // 在 CI 环境中使用 dot reporter（简洁），本地使用 list reporter（详细）
  reporter: process.env.CI ? [['list'], ['json', { outputFile: 'test-results/results.json' }]] : [['list'], ['html', { open: 'never' }]],
  /* 共享测试配置 */
  use: {
    /* 收集失败时的跟踪信息 */
    trace: 'on-first-retry',
    /* 截图配置 */
    screenshot: 'only-on-failure',
    /* 视频配置 */
    video: 'retain-on-failure',
    /* 基础 URL，方便在测试里使用相对路径 */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
  },

  /* 配置测试项目 */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // CI 环境下使用无头模式
        headless: true,
      },
    },

    // 本地开发时可以测试其他浏览器
    // CI 中只测试 chromium 以节省时间
    ...(process.env.CI
      ? []
      : [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]),
  ],

  /* 运行本地开发服务器 - E2E Demo */
  webServer: {
    command: 'pnpm dev:e2e',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
