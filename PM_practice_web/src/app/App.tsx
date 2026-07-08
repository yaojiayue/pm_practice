import { useState, useEffect, useRef } from "react";
import { BookOpen, Zap, History, ChevronRight, ArrowLeft, Send, Star, CheckCircle, AlertCircle, Lightbulb, Target, TrendingUp, Clock, Award, BarChart2, RefreshCw, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type View = "home" | "exercise" | "result" | "history";
type Difficulty = "入门" | "进阶" | "专家";
type Category = "功能设计" | "增长策略" | "用户体验" | "商业模式" | "竞品分析";

interface Question {
  id: number;
  app: string;
  appIcon: string;
  category: Category;
  difficulty: Difficulty;
  title: string;
  context: string;
  prompt: string;
  tags: string[];
  estimatedTime: string;
}

interface FeedbackItem {
  type: "strength" | "gap" | "insight";
  text: string;
}

interface HistoryRecord {
  id: number;
  question: Question;
  answer: string;
  score: number;
  date: string;
  feedback: FeedbackSection[];
}

interface FeedbackSection {
  label: string;
  content: string;
  items?: FeedbackItem[];
}

// ── Data ──────────────────────────────────────────────────────────────────

const questions: Question[] = [
  {
    id: 1,
    app: "微信",
    appIcon: "💬",
    category: "功能设计",
    difficulty: "入门",
    title: "微信「拍一拍」功能的产品价值是什么？",
    context: "2020年，微信在群聊中上线了「拍一拍」功能，用户可以轻拍好友的头像发送一条通知，被拍者会收到「xxx拍了拍你」的系统消息，且可自定义后缀文字。",
    prompt: "请从产品经理的视角，分析这个功能的设计意图、满足了哪些用户需求、商业价值，以及可能存在的问题。",
    tags: ["社交裂变", "轻互动", "群聊活跃度"],
    estimatedTime: "15 分钟",
  },
  {
    id: 2,
    app: "抖音",
    appIcon: "🎵",
    category: "增长策略",
    difficulty: "进阶",
    title: "抖音推荐算法如何平衡创作者与消费者利益？",
    context: "抖音的推荐系统以「去中心化」著称——即使是零粉丝的新账号，只要内容质量高也可能获得大规模推荐。这套机制背后是一套多层漏斗+实时反馈的分发逻辑。",
    prompt: "请分析抖音推荐机制的核心设计思路、它如何同时服务于创作者留存和用户体验，并探讨这套机制可能带来的内容生态问题。",
    tags: ["算法分发", "创作者经济", "内容生态"],
    estimatedTime: "25 分钟",
  },
  {
    id: 3,
    app: "支付宝",
    appIcon: "💳",
    category: "商业模式",
    difficulty: "进阶",
    title: "芝麻信用如何构建支付宝的护城河？",
    context: "支付宝于2015年推出芝麻信用，通过身份特质、行为偏好、履约能力、人脉关系、信用历史五个维度为用户打分（350-950分），并与租车、酒店押金免除等场景打通。",
    prompt: "请分析芝麻信用作为产品的核心商业逻辑、它如何提升用户黏性和平台价值，以及这个产品面临的风险和挑战。",
    tags: ["信用体系", "数据飞轮", "场景扩张"],
    estimatedTime: "20 分钟",
  },
  {
    id: 4,
    app: "小红书",
    appIcon: "📖",
    category: "用户体验",
    difficulty: "入门",
    title: "小红书「瀑布流」双列布局的产品决策",
    context: "小红书采用双列不等高的瀑布流布局展示内容，与微博的单列时间流和抖音的全屏沉浸式视频截然不同。这个选择塑造了小红书独特的内容消费体验。",
    prompt: "请分析小红书选择双列瀑布流而非单列的核心原因，这个布局如何影响用户行为、内容创作和平台商业化，以及它的局限性。",
    tags: ["信息架构", "内容消费", "视觉设计"],
    estimatedTime: "15 分钟",
  },
  {
    id: 5,
    app: "美团",
    appIcon: "🛵",
    category: "竞品分析",
    difficulty: "专家",
    title: "美团如何赢得外卖市场：对饿了么的竞争策略复盘",
    context: "2015年，饿了么是外卖市场的先行者，拥有更高的品牌认知度和市场份额。但到2018年，美团外卖已经以超过60%的市场份额实现反超，而饿了么被阿里巴巴收购。",
    prompt: "请从产品、运营、商业模式三个维度，分析美团如何实现对饿了么的超越，以及阿里收购饿了么后为何仍然没能赢回市场。",
    tags: ["市场竞争", "本地生活", "平台战略"],
    estimatedTime: "35 分钟",
  },
  {
    id: 6,
    app: "微信",
    appIcon: "💬",
    category: "功能设计",
    difficulty: "专家",
    title: "微信视频号的战略定位：腾讯的短视频反击战",
    context: "2020年1月，微信上线视频号，直接对标抖音和快手。视频号嵌入微信生态，打通公众号、小程序、朋友圈，但刻意保持相对克制的算法推荐，强调社交关系链分发。",
    prompt: "请分析视频号选择「弱算法+强社交」路线的战略逻辑，评估这个产品决策的利弊，并预判视频号在短视频市场的长期竞争力。",
    tags: ["产品战略", "生态协同", "算法vs社交"],
    estimatedTime: "30 分钟",
  },
  {
    id: 7,
    app: "拼多多",
    appIcon: "🛍️",
    category: "增长策略",
    difficulty: "进阶",
    title: "拼多多「砍一刀」的增长逻辑是什么？",
    context: "拼多多通过「邀请好友砍价」「拼团购买」等社交裂变机制，在微信生态内实现了爆炸式增长，3年内用户数超越京东，成为中国第二大电商平台。",
    prompt: "请分析拼多多社交裂变玩法的底层逻辑，它如何利用微信关系链获客，为什么这套打法在下沉市场特别有效，以及这类机制的边界和风险。",
    tags: ["社交裂变", "下沉市场", "病毒增长"],
    estimatedTime: "20 分钟",
  },
  {
    id: 8,
    app: "滴滴",
    appIcon: "🚗",
    category: "商业模式",
    difficulty: "进阶",
    title: "滴滴动态定价机制的产品设计逻辑",
    context: "滴滴采用动态定价（surge pricing）：高峰期、雨天、节假日价格上涨，同时给司机额外激励。这套机制引发了大量用户投诉，但也是平台调节供需的核心工具。",
    prompt: "请从供需调节、司机激励、用户体验三个维度分析滴滴动态定价的合理性，并探讨如何设计一套既能平衡供需又减少用户负面情绪的定价方案。",
    tags: ["动态定价", "双边市场", "供需调节"],
    estimatedTime: "25 分钟",
  },
  {
    id: 9,
    app: "微信",
    appIcon: "💬",
    category: "功能设计",
    difficulty: "入门",
    title: "微信「订阅号消息折叠」的产品决策",
    context: "2018年，微信将订阅号从首页独立入口改为折叠在「订阅号消息」列表中，不再在会话列表直接展示每条推送。此举引发大量公众号运营者强烈不满，但微信坚持了这一改动。",
    prompt: "请站在微信产品团队的角度，分析这个改动背后的用户价值主张和战略考量，评估它对微信生态各方（用户、创作者、广告主）的影响。",
    tags: ["信息流", "内容生态", "用户体验"],
    estimatedTime: "15 分钟",
  },
  {
    id: 10,
    app: "Keep",
    appIcon: "🏃",
    category: "商业模式",
    difficulty: "进阶",
    title: "Keep 如何从免费健身工具走向商业变现？",
    context: "Keep 是中国最大的运动健身 App，拥有超过 3 亿注册用户，但长期面临变现难题。公司尝试了会员订阅、卖课、卖运动装备、线下 Keepland 健身房等多种模式，盈利压力持续。",
    prompt: "请分析 Keep 面临的核心商业化挑战，评估其现有变现路径的优劣，并设计一套你认为更合理的商业模式组合，说明理由。",
    tags: ["订阅变现", "健康赛道", "用户付费意愿"],
    estimatedTime: "25 分钟",
  },
  {
    id: 11,
    app: "B站",
    appIcon: "📺",
    category: "用户体验",
    difficulty: "进阶",
    title: "B站「答题入会」机制的产品价值与代价",
    context: "B站长期坚持正式会员需通过 100 题知识考试才能解锁完整功能。这套机制在互联网行业极为罕见，被认为是 B站社区文化高质量的护城河，但也被诟病阻碍了用户增长。",
    prompt: "请分析「答题入会」机制如何塑造了B站的社区氛围，随着B站寻求破圈和商业化，这套机制是否应该保留？如果你是产品负责人，你会怎么决策？",
    tags: ["社区运营", "用户筛选", "破圈增长"],
    estimatedTime: "20 分钟",
  },
  {
    id: 12,
    app: "淘宝",
    appIcon: "🏪",
    category: "功能设计",
    difficulty: "专家",
    title: "淘宝「千人千面」个性化推荐的产品演进",
    context: "淘宝首页从早期的固定分类导航，历经多次改版，逐步演变为以个性化推荐为核心的信息流。每位用户看到的首页内容几乎完全不同，背后是阿里 AI 团队的实时推荐系统。",
    prompt: "请分析淘宝首页从「货架陈列」到「个性化信息流」转型的产品逻辑，这个转型解决了什么问题、带来了什么新问题，以及对商家生态产生了哪些深远影响。",
    tags: ["个性化推荐", "信息流", "电商生态"],
    estimatedTime: "30 分钟",
  },
  {
    id: 13,
    app: "钉钉",
    appIcon: "📌",
    category: "竞品分析",
    difficulty: "进阶",
    title: "钉钉 vs 企业微信：两种 B 端产品哲学的碰撞",
    context: "钉钉（阿里）和企业微信（腾讯）是中国最大的两款企业协作工具。钉钉主打管理控制（打卡、审批、已读回执），企业微信主打连接微信生态。两者在功能上高度重叠，但定位和用户口碑差异显著。",
    prompt: "请从产品定位、目标用户、核心功能、生态策略四个维度对比分析钉钉和企业微信的差异，并判断在未来 3-5 年谁更有竞争优势，说明你的推理过程。",
    tags: ["B端产品", "竞品对比", "生态战略"],
    estimatedTime: "30 分钟",
  },
  {
    id: 14,
    app: "网易云音乐",
    appIcon: "🎵",
    category: "用户体验",
    difficulty: "入门",
    title: "网易云音乐「评论区」为何成为产品核心竞争力？",
    context: "网易云音乐的评论区以高质量、情感共鸣著称，「云村」文化让其在与QQ音乐、酷狗的竞争中保持差异化。「每日30条评论」的限制、评论点赞排序等设计都有意为之。",
    prompt: "请分析网易云音乐如何通过产品设计培育了高质量评论生态，这套机制与 YouTube、微博评论区的差异是什么，以及音乐评论区对商业化有哪些帮助和限制。",
    tags: ["社区氛围", "UGC内容", "差异化竞争"],
    estimatedTime: "15 分钟",
  },
  {
    id: 15,
    app: "高德地图",
    appIcon: "🗺️",
    category: "增长策略",
    difficulty: "进阶",
    title: "高德如何用「打车」入口反攻滴滴？",
    context: "2018年，高德在地图 App 内上线打车功能，采用聚合模式接入多家出行服务商，而非自营运力。这一「聚合打车」模式后来被百度地图、美团等竞相模仿，成为行业标准。",
    prompt: "请分析高德选择「聚合模式」而非「自营模式」进入网约车市场的战略逻辑，这个选择如何规避了与滴滴的直接竞争，以及聚合模式在长期竞争中的优势与软肋。",
    tags: ["聚合平台", "出行战略", "场景入口"],
    estimatedTime: "20 分钟",
  },
  {
    id: 16,
    app: "微博",
    appIcon: "🌐",
    category: "竞品分析",
    difficulty: "专家",
    title: "微博为何没能被微信取代？",
    context: "2012年微信崛起后，业界普遍预测微博将被取代。但十年后微博依然活跃，月活保持在 5 亿左右。微博与微信形成了截然不同的内容生态和社交场景，各占一方。",
    prompt: "请深度分析微博在微信冲击下「存活」的核心原因，两款产品分别满足了用户的哪些不可替代需求，微博近年来的产品策略（如超话、视频化）是否走对了方向？",
    tags: ["公域流量", "内容平台", "社交分层"],
    estimatedTime: "35 分钟",
  },
];

const mockFeedbacks: Record<number, FeedbackSection[]> = {
  1: [
    {
      label: "核心洞察",
      content: "你对「轻互动」场景的理解基本准确。拍一拍的本质是降低社交互动的门槛，填补了「已读」和「回复」之间的空白地带。",
      items: [
        { type: "strength", text: "正确识别了降低互动成本的核心价值" },
        { type: "strength", text: "提到了群聊活跃度的场景，方向正确" },
        { type: "gap", text: "未分析「自定义后缀」的产品价值——这是制造传播点的关键设计" },
        { type: "gap", text: "未提及对微信「已读不回」社交焦虑文化的针对性解决" },
      ],
    },
    {
      label: "参考框架",
      content: "优秀的分析应覆盖：① 用户场景切分（熟人/半熟人/群聊）② 心理机制（社会存在感、低风险互动）③ 内容传播属性（后缀的UGC创意）④ 数据指标（DAU贡献、消息量）⑤ 潜在负面（骚扰问题）",
    },
    {
      label: "参考答案要点",
      content: "拍一拍解决的是「我注意到你了，但不知道说什么」的轻量级存在感问题。设计亮点在于三点：无需思考内容即可建立连接（降低回复焦虑）；自定义后缀创造了二次传播和娱乐内容；群聊场景制造了仪式感和趣味性。商业价值在于提升群聊日活和消息密度，间接强化微信作为日常通讯首选的地位。",
    },
  ],
  2: [
    {
      label: "核心洞察",
      content: "你对抖音分发机制的理解展现了一定深度。去中心化的核心是用「内容质量信号」替代「账号权重信号」，这是对传统粉丝经济的颠覆。",
      items: [
        { type: "strength", text: "理解了多层漏斗测试的基本逻辑" },
        { type: "strength", text: "提到了创作者与消费者的双边市场性质" },
        { type: "gap", text: "未分析完播率、互动率等核心指标如何驱动分发决策" },
        { type: "gap", text: "未讨论「信息茧房」和内容同质化的生态风险" },
        { type: "insight", text: "进阶思考：抖音的机制如何影响内容创作策略——为什么前3秒是生死线？" },
      ],
    },
    {
      label: "参考框架",
      content: "分析推荐系统应从：① 目标函数（平台优化什么？）② 信号体系（输入什么数据？）③ 分发策略（如何决策？）④ 生态影响（对供给侧/需求侧的塑造）⑤ 长期风险（内容质量、多样性）",
    },
    {
      label: "参考答案要点",
      content: "抖音的核心是以「用户时长」为北极星指标，用完播率、互动率、转发率构建实时反馈的分发漏斗。对创作者：去中心化降低了入场门槛，但也造成了算法依赖和内容格式收敛；对消费者：极度个性化提升了短期满意度，但长期产生信息茧房。平台通过双边市场的正反馈实现了内容供给规模化，代价是内容同质化和创作者的「流量焦虑」。",
    },
  ],
};

const getDifficultyColor = (d: Difficulty) => {
  if (d === "入门") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (d === "进阶") return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-rose-600 bg-rose-50 border-rose-200";
};

const getCategoryColor = (c: Category) => {
  const map: Record<Category, string> = {
    "功能设计": "text-violet-600 bg-violet-50",
    "增长策略": "text-sky-600 bg-sky-50",
    "用户体验": "text-teal-600 bg-teal-50",
    "商业模式": "text-orange-600 bg-orange-50",
    "竞品分析": "text-pink-600 bg-pink-50",
  };
  return map[c];
};

// ── Sub-components ──────────────────────────────────────────────────────────

function Tag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono tracking-wide border ${className}`}>
      {children}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#D97706" : "#DC2626";

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="72" cy="72" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-4xl font-bold" style={{ color, fontFamily: "Fraunces, serif" }}>{score}</div>
        <div className="text-xs text-muted-foreground font-mono mt-0.5">/ 100</div>
      </div>
    </div>
  );
}

// ── Views ──────────────────────────────────────────────────────────────────

function HomeView({
  onStart,
  history,
  onViewHistory,
}: {
  onStart: (q: Question) => void;
  history: HistoryRecord[];
  onViewHistory: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<Category | "全部">("全部");
  const categories: Array<Category | "全部"> = ["全部", "功能设计", "增长策略", "用户体验", "商业模式", "竞品分析"];

  const filtered = activeCategory === "全部"
    ? questions
    : questions.filter(q => q.category === activeCategory);

  const streak = history.length;
  const avgScore = history.length
    ? Math.round(history.reduce((s, r) => s + r.score, 0) / history.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Target size={16} className="text-primary-foreground" />
            </div>
            <span style={{ fontFamily: "Fraunces, serif" }} className="text-lg font-semibold tracking-tight">
              PM 思维练习场
            </span>
          </div>
          <button
            onClick={onViewHistory}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
          >
            <History size={15} />
            练习记录
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-8 flex-wrap">
            <div>
              <p className="text-primary font-mono text-sm tracking-widest uppercase mb-3">Product Manager Training</p>
              <h1 className="text-5xl font-bold leading-tight mb-4" style={{ fontFamily: "Fraunces, serif" }}>
                用真实案例<br />
                <em className="not-italic text-primary">磨砺</em>产品思维
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                精选微信、抖音、支付宝等主流 App 的产品决策，写下你的分析，获得 AI 深度点评。
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-shrink-0">
              <div className="bg-card border border-border rounded-2xl p-5 min-w-[110px]">
                <div className="text-3xl font-bold text-primary mb-1" style={{ fontFamily: "Fraunces, serif" }}>{streak}</div>
                <div className="text-xs text-muted-foreground font-mono">练习次数</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 min-w-[110px]">
                <div className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "Fraunces, serif" }}>
                  {avgScore > 0 ? avgScore : "—"}
                </div>
                <div className="text-xs text-muted-foreground font-mono">平均得分</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 min-w-[110px]">
                <div className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "Fraunces, serif" }}>{questions.length}</div>
                <div className="text-xs text-muted-foreground font-mono">题库总量</div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's pick */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-mono text-primary tracking-widest uppercase">今日推荐</span>
          </div>
          <div
            className="relative bg-card border border-primary/20 rounded-2xl p-7 cursor-pointer group overflow-hidden"
            onClick={() => onStart(questions[1])}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{questions[1].appIcon}</span>
                  <span className="text-sm text-muted-foreground font-mono">{questions[1].app}</span>
                  <Tag className={getDifficultyColor(questions[1].difficulty)}>{questions[1].difficulty}</Tag>
                </div>
                <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: "Fraunces, serif" }}>
                  {questions[1].title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mb-4">
                  {questions[1].context}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {questions[1].tags.map(t => (
                      <span key={t} className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {questions[1].estimatedTime}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ChevronRight size={20} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Question grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(q => {
            const done = history.find(h => h.question.id === q.id);
            return (
              <div
                key={q.id}
                onClick={() => onStart(q)}
                className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/30 hover:bg-card/80 transition-all group relative"
              >
                {done && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-mono text-emerald-600">
                    <CheckCircle size={12} />
                    已完成 · {done.score}分
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{q.appIcon}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${getCategoryColor(q.category)}`}>{q.category}</span>
                  <Tag className={`ml-auto ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</Tag>
                </div>
                <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors leading-snug" style={{ fontFamily: "Fraunces, serif" }}>
                  {q.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
                  {q.context}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    {q.estimatedTime}
                  </div>
                  <ChevronRight size={15} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function ExerciseView({
  question,
  onBack,
  onSubmit,
}: {
  question: Question;
  onBack: () => void;
  onSubmit: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (answer.trim().length < 50) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 2200));
    onSubmit(answer);
  };

  const wordCount = answer.trim().length;
  const progress = Math.min(wordCount / 300, 1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-2xl">{question.appIcon}</span>
            <span className="text-sm text-muted-foreground font-mono">{question.app}</span>
            <span className="text-muted-foreground/30 font-mono">/</span>
            <span className="text-sm text-muted-foreground line-clamp-1">{question.title}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
            <Clock size={13} />
            {formatTime(elapsed)}
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: Question */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Tag className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Tag>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${getCategoryColor(question.category)}`}>{question.category}</span>
          </div>

          <h1 className="text-3xl font-bold leading-snug" style={{ fontFamily: "Fraunces, serif" }}>
            {question.title}
          </h1>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <BookOpen size={12} />
              背景介绍
            </div>
            <p className="text-foreground/90 leading-relaxed">{question.context}</p>
          </div>

          <div className="bg-primary/5 border border-primary/15 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-primary uppercase tracking-wider">
              <Target size={12} />
              练习题目
            </div>
            <p className="text-foreground leading-relaxed font-medium">{question.prompt}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Lightbulb size={12} />
              参考思考维度（不必面面俱到）
            </div>
            <div className="flex flex-wrap gap-2">
              {question.tags.map(t => (
                <span key={t} className="text-xs font-mono text-muted-foreground bg-muted/40 border border-border px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Answer */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-card border border-border rounded-2xl overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">你的分析</span>
              <span className="text-xs font-mono text-muted-foreground">{wordCount} 字</span>
            </div>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="从用户需求、商业价值、设计逻辑等角度展开你的思考…"
              className="w-full h-[520px] p-4 bg-transparent text-foreground text-sm leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/40"
            />
            {/* Progress bar */}
            <div className="px-4 pb-4">
              <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                {wordCount < 50 ? `至少再写 ${50 - wordCount} 字才能提交` : wordCount < 300 ? "内容越充分，反馈越精准" : "内容详实，可以提交了 ✓"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={wordCount < 50 || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                AI 正在批改…
              </>
            ) : (
              <>
                <Send size={16} />
                提交作业
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground font-mono">
            提交后 AI 将给出得分、优缺点及参考答案
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultView({
  record,
  onRetry,
  onHome,
}: {
  record: HistoryRecord;
  onRetry: () => void;
  onHome: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const { question, answer, score, feedback } = record;

  const scoreLabel = score >= 85 ? "优秀" : score >= 70 ? "良好" : score >= 55 ? "中等" : "需加强";
  const scoreBg = score >= 85 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : score >= 55 ? "text-orange-600" : "text-rose-600";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onHome} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm text-muted-foreground mr-auto">批改结果</span>
          <button onClick={onRetry} className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <RefreshCw size={13} />
            重新练习
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Score card */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <ScoreRing score={score} />
          <div className="flex-1 text-center md:text-left">
            <div className={`text-lg font-bold mb-1 ${scoreBg}`} style={{ fontFamily: "Fraunces, serif" }}>{scoreLabel}</div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
              {question.title}
            </h2>
            <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
              <Tag className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Tag>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${getCategoryColor(question.category)}`}>{question.category}</span>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Clock size={11} /> {record.date}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "分析深度", val: Math.min(100, score + Math.floor(Math.random() * 10 - 5)) },
              { label: "框架完整", val: Math.max(40, score - Math.floor(Math.random() * 15)) },
              { label: "商业洞察", val: Math.min(100, score + Math.floor(Math.random() * 8)) },
            ].map(item => (
              <div key={item.label} className="bg-muted/30 rounded-xl p-3">
                <div className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>{item.val}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/20 p-1 rounded-xl w-fit">
          {["AI 点评", "你的答案", "参考答案"].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === i ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="space-y-4">
            {feedback.slice(0, -1).map((section, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "Fraunces, serif" }}>
                  <span className="w-5 h-5 rounded bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">{i + 1}</span>
                  {section.label}
                </h3>
                <p className="text-foreground/90 leading-relaxed mb-4">{section.content}</p>
                {section.items && (
                  <div className="space-y-2">
                    {section.items.map((item, j) => (
                      <div key={j} className={`flex items-start gap-3 p-3 rounded-lg ${
                        item.type === "strength" ? "bg-emerald-500/5 border border-emerald-500/15" :
                        item.type === "gap" ? "bg-rose-500/5 border border-rose-500/15" :
                        "bg-violet-500/5 border border-violet-500/15"
                      }`}>
                        {item.type === "strength" && <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />}
                        {item.type === "gap" && <AlertCircle size={15} className="text-rose-600 mt-0.5 flex-shrink-0" />}
                        {item.type === "insight" && <Lightbulb size={15} className="text-violet-600 mt-0.5 flex-shrink-0" />}
                        <span className="text-sm leading-relaxed">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <BookOpen size={12} />
              你的作答
            </div>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {activeTab === 2 && (
          <div className="bg-card border border-primary/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-primary uppercase tracking-wider">
              <Star size={12} />
              参考答案要点
            </div>
            <p className="text-foreground/90 leading-relaxed">
              {feedback[feedback.length - 1]?.content}
            </p>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors font-medium"
          >
            返回题库
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <RefreshCw size={15} />
            再练一次
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryView({ history, onBack, onReview }: { history: HistoryRecord[]; onBack: () => void; onReview: (r: HistoryRecord) => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontFamily: "Fraunces, serif" }} className="font-semibold">练习记录</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {history.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "Fraunces, serif" }}>还没有练习记录</h2>
            <p className="text-muted-foreground">完成第一道题后，记录会出现在这里</p>
            <button onClick={onBack} className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
              开始练习
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[...history].reverse().map(r => (
              <div
                key={r.id}
                onClick={() => onReview(r)}
                className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-all flex items-center gap-5 group"
              >
                <div className="w-14 h-14 rounded-xl bg-muted/30 flex items-center justify-center text-2xl flex-shrink-0">
                  {r.question.appIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-primary transition-colors" style={{ fontFamily: "Fraunces, serif" }}>
                    {r.question.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <Tag className={getDifficultyColor(r.question.difficulty)}>{r.question.difficulty}</Tag>
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <Clock size={11} /> {r.date}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-bold ${r.score >= 80 ? "text-emerald-600" : r.score >= 60 ? "text-amber-600" : "text-rose-600"}`} style={{ fontFamily: "Fraunces, serif" }}>
                    {r.score}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">分</div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Scoring logic ──────────────────────────────────────────────────────────

function generateScore(answer: string, questionId: number): number {
  const len = answer.trim().length;
  let base = 45;
  if (len > 100) base += 10;
  if (len > 200) base += 8;
  if (len > 400) base += 8;
  if (len > 600) base += 7;
  const keywords: Record<number, string[]> = {
    1: ["用户", "需求", "互动", "社交", "群聊", "产品", "价值", "体验"],
    2: ["算法", "推荐", "创作者", "用户", "内容", "分发", "平台", "生态"],
    3: ["信用", "数据", "商业", "场景", "用户", "价值", "风险"],
    4: ["布局", "用户", "内容", "体验", "视觉", "商业"],
    5: ["竞争", "策略", "市场", "用户", "运营", "产品"],
    6: ["战略", "算法", "社交", "视频", "生态", "竞争"],
  };
  const kws = keywords[questionId] || [];
  const matched = kws.filter(k => answer.includes(k)).length;
  base += Math.floor((matched / kws.length) * 22);
  base += Math.floor(Math.random() * 4) - 2;
  return Math.min(98, Math.max(38, base));
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("home");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentRecord, setCurrentRecord] = useState<HistoryRecord | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const handleStartQuestion = (q: Question) => {
    setCurrentQuestion(q);
    setView("exercise");
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!currentQuestion) return;
    const score = generateScore(answer, currentQuestion.id);
    const feedbackData = mockFeedbacks[currentQuestion.id] || [
      {
        label: "综合点评",
        content: "你的分析展示了对产品思维的基本理解，但还有提升空间。建议从用户价值、商业价值、竞品对比三个维度系统化你的分析框架。",
        items: [
          { type: "strength" as const, text: "能够从用户角度出发思考问题" },
          { type: "gap" as const, text: "缺乏对商业模式和数据指标的量化分析" },
          { type: "insight" as const, text: "思考：这个功能为平台带来了哪些关键指标的提升？" },
        ],
      },
      {
        label: "参考答案要点",
        content: "优秀的产品分析需要覆盖：用户需求层（谁在使用、为什么使用）、产品设计层（如何实现、为何这样设计）、商业价值层（对平台的 KPI 贡献）以及风险与局限层。",
      },
    ];

    const record: HistoryRecord = {
      id: Date.now(),
      question: currentQuestion,
      answer,
      score,
      date: new Date().toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      feedback: feedbackData,
    };

    setHistory(prev => [...prev, record]);
    setCurrentRecord(record);
    setView("result");
  };

  return (
    <div className="size-full">
      {view === "home" && (
        <HomeView
          onStart={handleStartQuestion}
          history={history}
          onViewHistory={() => setView("history")}
        />
      )}
      {view === "exercise" && currentQuestion && (
        <ExerciseView
          question={currentQuestion}
          onBack={() => setView("home")}
          onSubmit={handleSubmitAnswer}
        />
      )}
      {view === "result" && currentRecord && (
        <ResultView
          record={currentRecord}
          onRetry={() => handleStartQuestion(currentRecord.question)}
          onHome={() => setView("home")}
        />
      )}
      {view === "history" && (
        <HistoryView
          history={history}
          onBack={() => setView("home")}
          onReview={r => {
            setCurrentRecord(r);
            setView("result");
          }}
        />
      )}
    </div>
  );
}
