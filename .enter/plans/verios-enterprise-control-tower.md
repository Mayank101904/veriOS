# VeriOS – Enterprise AI Decision Control Tower

## Context
当前工作区是 Vite + React 19 + TypeScript + Tailwind + shadcn 模板，只有占位首页，尚未接入 Clerk、Convex、AI provider 或业务模块。用户要求的目标是 Next.js 15 App Router + Clerk + Convex ONLY；当前 Enter 运行时不能直接替换为 Next.js 服务端运行时，因此采用兼容优先的落地方式：前端按 Next App Router 的领域边界组织，Convex 后端按独立 `convex/` 目录组织，避免把业务逻辑绑定到 Vite 页面或任何替代后端。最终接入 Next.js/Convex Cloud 时只需替换应用壳与 provider wiring，不重写核心领域模型。

第一阶段将交付可运行的 VeriOS 核心控制塔与 Decision Center，使用真实的 Convex/Clerk 契约设计，不伪造后端已连接状态；后续模块按依赖顺序扩展。UI 采用克制的深色“审计控制室”方向：煤灰背景、冷蓝主色、琥珀/红色风险语义、密集但有呼吸感的数据布局，避免泛化 admin 模板和装饰性玻璃效果。

## Recommended approach

1. **建立应用与领域骨架**
   - 将现有单页入口重构为可迁移的 app shell：可折叠侧栏、粘性顶部栏、workspace switcher、全局搜索/command palette、通知中心、响应式移动导航。
   - 建立 `src/features/*`、`src/components/layout/*`、`src/components/data-display/*`、`src/lib/*`、`src/types/*` 与 `convex/*` 边界；页面只组合 feature，不承载数据访问或业务规则。
   - 引入并统一使用现有 shadcn primitives、Lucide、Framer Motion、React Hook Form、Zod、Recharts；所有颜色、阴影、密度、状态色进入 design tokens，清理占位渐变与默认 App.css。

2. **按 Next/Clerk/Convex 目标契约实现认证与组织上下文**
   - 定义 Clerk 用户/组织/角色映射接口与受保护路由边界；在当前运行时提供兼容的 provider adapter，不把 mock 数据伪装成已登录后端。
   - 在 Convex 侧创建 `schema.ts` 及用户、组织、团队、项目、设置、通知关系；所有 query/mutation/action 使用组织作用域、RBAC 校验、分页参数与输入验证。
   - 保留未来 Next.js `app/layout.tsx`、`(auth)`、`(dashboard)` 路由可直接映射的页面/feature 结构，当前预览继续通过现有 router 承载同一页面组件。

3. **实现控制塔 Dashboard**
   - 实现概览指标：组织、项目、用户、模型、待审核、高风险、provider health、compliance score、risk distribution、recent activity、system status。
   - 采用可复用 metric cards、风险分布图、决策时间线、活动 feed、状态 badge、skeleton/empty/error states；数据读取通过 Convex query contract，禁止在前端散落静态业务数组。
   - 增加全局筛选、时间范围、项目范围和通知入口，桌面三栏与移动端抽屉布局保持同一信息架构。

4. **实现 Decision Center 核心闭环**
   - 三面板布局：左侧决策列表与筛选，中间决策详情/提示词/AI responses/时间线，右侧 risk/policy/audit/insights tabs；宽度可调整且移动端按步骤切换。
   - 创建决策表单：项目、提示词、模型选择、执行策略、审批策略与策略校验；使用 React Hook Form + Zod，支持 loading、验证、失败重试与 optimistic UI。
   - response comparison 支持 provider/model 分组、side-by-side、展开解释、差异查看；指标统一为 confidence、consensus、risk、bias、privacy、security、hallucination、fairness、trust。

5. **建立 AI provider adapter 与分析流水线契约**
   - 在 `src/lib/ai`/`convex` 中定义 provider-neutral interfaces：provider、model、request、response、analysis result、execution status；Gemini 为默认 provider，OpenAI/Claude/Grok/Mistral/Llama/custom 只新增 adapter，不修改决策业务逻辑。
   - Convex actions 负责调用 provider、记录独立 response、调度分析与状态更新；核心业务状态通过 queries/subscriptions 实时刷新。
   - 风险、共识、偏差、隐私、安全、幻觉、策略验证拆分为可组合分析器，输出带版本、证据、严重级别和可解释原因的结果；不在前端计算或硬编码“通过”。

6. **实现 policy / approval / audit / reporting 基础模块**
   - 增加 policies、violations、approvals、audit、reports、analytics、storage、actions、cron、notifications 等 Convex 文件，并建立索引、关系、immutable audit 写入约束与组织隔离。
   - 审批规则：低风险自动批准；中风险 reviewer；高风险 compliance；critical block execution。Decision Center 内完成 approve/reject/request changes，并记录前后值、执行时长、provider、状态及审计 metadata。
   - 报告页面先提供决策/合规/风险/安全/使用报告查询契约与导出入口；CSV/Excel/PDF 通过模块化 export service 设计，避免把导出逻辑耦合到表格组件。

7. **完善 enterprise UX 与质量边界**
   - 对所有主页面提供 skeleton、空状态、错误状态、权限不足状态、网络重试；桌面、平板、窄屏分别验证。
   - 使用语义 token、键盘可访问的命令面板/菜单/弹窗、明确 focus ring、对比度与 reduced-motion 支持；所有图标使用 Lucide，不使用 emoji。
   - 添加边界类型、表单 schema、adapter contract 与关键状态转换的测试入口；保留 `pnpm lint`、TypeScript 检查和生产构建验证。

## Critical files and boundaries

- `src/App.tsx`, `src/router.tsx`: 当前兼容壳与路由映射；最终可迁移到 Next App Router 页面。
- `src/pages/Index.tsx`: 替换为控制塔入口，不再保留占位 hero。
- `src/index.css`, `src/App.css`, `tailwind.config.ts`: VeriOS 设计 tokens、深色主题、布局与动效基础。
- `src/components/ui/*`: 复用并按语义 token 调整 shadcn primitives，不重复创建基础控件。
- `src/components/layout/*`, `src/components/data-display/*`: app shell、命令面板、指标卡、图表、表格和状态组件。
- `src/features/dashboard/*`, `src/features/decisions/*`, `src/features/risk/*`, `src/features/policies/*`, `src/features/approvals/*`, `src/features/audit/*`, `src/features/reports/*`, `src/features/settings/*`: 可独立演进的业务 feature。
- `src/lib/ai/*`, `src/lib/validation/*`, `src/lib/permissions/*`, `src/types/*`: provider adapters、Zod schemas、RBAC 与共享类型。
- `convex/schema.ts`、`convex/users.ts`、`convex/organizations.ts`、`convex/teams.ts`、`convex/projects.ts`、`convex/providers.ts`、`convex/models.ts`、`convex/prompts.ts`、`convex/decisions.ts`、`convex/responses.ts`、`convex/consensus.ts`、`convex/risk.ts`、`convex/policies.ts`、`convex/violations.ts`、`convex/approvals.ts`、`convex/audit.ts`、`convex/analytics.ts`、`convex/reports.ts`、`convex/notifications.ts`、`convex/storage.ts`、`convex/settings.ts`、`convex/actions.ts`、`convex/cron.ts`: Convex-only 数据、实时查询、动作、存储、调度与安全边界。

## Implementation checklist

- [ ] Replace the placeholder homepage with a responsive VeriOS app shell and dashboard route while preserving current preview boot.
- [ ] Add the VeriOS semantic dark design tokens and remove direct placeholder colors/styles from the active UI.
- [ ] Add reusable sidebar, header, workspace switcher, command palette, notification center, metric card, chart, table, badge, skeleton, empty, and error components.
- [ ] Define shared strict TypeScript entities and Zod input schemas for organizations, projects, providers, models, decisions, responses, analyses, policies, approvals, audits, and reports.
- [ ] Create the Convex schema with organization-scoped indexes, relationships, timestamps, status fields, and immutable audit records.
- [ ] Add Clerk/organization/RBAC adapter boundaries and Convex authorization helpers without exposing provider secrets.
- [ ] Implement the Decision Center three-panel workflow and decision creation validation.
- [ ] Implement provider-neutral adapters with Gemini as the initial provider contract and extension points for all requested providers.
- [ ] Implement response comparison, explanations, consensus/risk summaries, policy violations, approval actions, and audit timeline surfaces.
- [ ] Add dashboard analytics queries, notification state, report query/export contracts, storage contract, scheduled jobs, and provider health actions.
- [ ] Add loading, empty, error, permission, retry, keyboard, responsive, and reduced-motion states across the primary workflow.

## Verification checklist

- [ ] Verify `/` renders the dashboard shell without runtime errors and the existing preview router still boots.
- [ ] Verify the sidebar collapses, mobile navigation opens, command palette is keyboard reachable, and notification/workspace controls have accessible labels.
- [ ] Verify dashboard charts and tables render with query-driven typed data contracts and show explicit loading/empty/error states.
- [ ] Verify invalid decision input is rejected by Zod, valid input produces a typed execution request, and duplicate submit is prevented.
- [ ] Verify a decision state can move through pending, analysis, review, approved/rejected, and blocked states with role-aware controls.
- [ ] Verify response comparison keeps each provider response independent and displays all requested score dimensions with explanations.
- [ ] Verify high/critical risk cannot expose an approval action to an unauthorized role and every approval/rejection creates an immutable audit event.
- [ ] Verify organization/project scoping is present on Convex queries, mutations, actions, and indexes; pagination contracts are explicit.
- [ ] Verify no private provider credential is sent to client code and no unsupported backend is introduced.
- [ ] Run the repository lint/type/build verification scope after implementation and resolve all reported errors before handoff.
