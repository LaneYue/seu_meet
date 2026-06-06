import type { Achievement } from "../types/linkit"

export const allAchievements: Achievement[] = [
  // S 四牌楼
  { code: "SL01", name: "老图钉子户", campus: "S", category: "L", conditionDesc: "连续 7 天在老图书馆签到自习", humorDesc: "老图的门卫大爷已经把你的脸加进了白名单，进出不用刷卡了", unlocked: false },
  { code: "SL02", name: "大礼堂前晨读者", campus: "S", category: "L", conditionDesc: "清晨 6:30 前在大礼堂前晨读 5 次", humorDesc: "你比大礼堂的保洁阿姨起得都早，连鸽子都来听你背单词", unlocked: false },
  { code: "SL03", name: "涌泉池畔思考者", campus: "S", category: "L", conditionDesc: "在涌泉池边坐满 30 分钟 x 10 次", humorDesc: "涌泉池的水都认识你了，连金鱼都学会点头", unlocked: false },
  { code: "SI01", name: "蓁巷搭子", campus: "S", category: "I", conditionDesc: "和 1 个搭子一起走完蓁巷全段", humorDesc: "蓁巷的猫都认识你俩了，下雨天还会等你", unlocked: false },
  { code: "SI02", name: "梧桐树下对话", campus: "S", category: "I", conditionDesc: "在梧桐树下和陌生人完成 1 次 5 分钟以上对话", humorDesc: "一片梧桐叶落在你俩中间，民国文学的剧本有了", unlocked: false },
  { code: "SI03", name: "四牌楼合影狂魔", campus: "S", category: "I", conditionDesc: "集齐 10 个四牌楼隐藏机位打卡", humorDesc: "你的朋友圈最近 30 张都是四牌楼，朋友以为你迷路了", unlocked: false },
  { code: "SM01", name: "四牌楼十日环游", campus: "S", category: "M", conditionDesc: "连续 10 天绕四牌楼走一圈", humorDesc: "你的微信步数成了宿舍 daily TOP 1，室友以为你兼职跑腿", unlocked: false },
  { code: "SM02", name: "四牌楼夜猫", campus: "S", category: "M", conditionDesc: "凌晨 2 点后从四牌楼大门回宿舍", humorDesc: "门卫大爷心疼地塞给你一袋零食，劝你搬回学校住", unlocked: false },
  { code: "SM03", name: "健雄院夜行者", campus: "S", category: "M", conditionDesc: "深夜 11 点后路过健雄院 5 次", humorDesc: "吴健雄先生在天上看着你，微微点头：你比当年的她还卷", unlocked: false },
  { code: "SF01", name: "蓁巷锅贴侠", campus: "S", category: "F", conditionDesc: "在蓁巷吃遍 5 家锅贴店", humorDesc: "老板们已经能闭着眼做出你的那份，还附赠一杯醋", unlocked: false },
  { code: "SF02", name: "南门扫街王", campus: "S", category: "F", conditionDesc: "四牌楼南门小吃街打卡 8 家店", humorDesc: "你的大众点评 LV 等级在东大无人能敌，连新店老板都先敬你三分", unlocked: false },
  { code: "SF03", name: "四牌楼咖啡鉴赏家", campus: "S", category: "F", conditionDesc: "在四牌楼喝过 5 家不同的咖啡馆", humorDesc: "你的舌头能品出哪杯是周末特调，咖啡师开始怕你了", unlocked: false },
  { code: "SH01", name: "大礼堂见证者", campus: "S", category: "H", conditionDesc: "参加 1 次大礼堂内举办的活动", humorDesc: "你见证了百年大礼堂的第 N 次掌声，门票钱都值回来了", unlocked: false },
  { code: "SH02", name: "吴健雄追光者", campus: "S", category: "H", conditionDesc: "参观吴健雄纪念馆并提交 1 段感悟", humorDesc: "物理学奖离你远了点，但你的脑洞里种下了一颗原子核", unlocked: false },
  { code: "SH03", name: "中央大学溯源者", campus: "S", category: "H", conditionDesc: "解锁 5 个中央大学旧址打卡点", humorDesc: "1902 的风从老照片里吹出来，你闻到了中央大学食堂的红烧肉味", unlocked: false },
  // J 九龙湖
  { code: "JL01", name: "图书馆占座王", campus: "J", category: "L", conditionDesc: "学期内累计占座 30 天", humorDesc: "你的书包和保温杯在图书馆有了固定工位，清洁阿姨都认识", unlocked: false },
  { code: "JL02", name: "通宵自习幸存者", campus: "J", category: "L", conditionDesc: "在通宵自习室撑到天亮", humorDesc: "太阳升起来时你眼睛还亮着，靠的不是咖啡，是不想输", unlocked: false },
  { code: "JL03", name: "橘园考研陪跑员", campus: "J", category: "L", conditionDesc: "连续 100 天进入图书馆复习", humorDesc: "Day 1 你在，Day 100 你还在，连图书馆的空调都为你单独开过夜档", unlocked: false },
  { code: "JI01", name: "橘园搭子", campus: "J", category: "I", conditionDesc: "找到 3 个橘园固定饭搭", humorDesc: "橘园 4 个窗口的阿姨都认识你们仨，问你今天几个人", unlocked: false },
  { code: "JI02", name: "梅园球友", campus: "J", category: "I", conditionDesc: "在梅园球场认识 5 个球友", humorDesc: "你的篮球鞋和梅园的塑胶地摩擦出了火花，被称梅园三步上篮王", unlocked: false },
  { code: "JI03", name: "桃园饭搭", campus: "J", category: "I", conditionDesc: "桃园食堂和不同人吃饭 10 次", humorDesc: "桃园的米线师傅看你换搭档的速度，比你点单的速度还快", unlocked: false },
  { code: "JM01", name: "九龙湖环湖者", campus: "J", category: "M", conditionDesc: "完成 1 次九龙湖环湖跑", humorDesc: "你跑完了整个湖，校车司机都问你怎么不坐车", unlocked: false },
  { code: "JM02", name: "将军山远足", campus: "J", category: "M", conditionDesc: "登顶将军山 1 次", humorDesc: "你在山顶拍的照片发到群里，室友以为你去了川西", unlocked: false },
  { code: "JM03", name: "校车通勤王", campus: "J", category: "M", conditionDesc: "一学期内乘坐九龙湖到四牌楼校车 30 次", humorDesc: "校车司机一看到你就喊四牌楼是吧，第三个位子给你留着", unlocked: false },
  { code: "JF01", name: "食堂全勤奖", campus: "J", category: "F", conditionDesc: "把 4 个食堂全吃一遍", humorDesc: "你解锁了橘园/梅园/桃园/楠园的全图鉴，食堂阿姨集体给你鼓掌", unlocked: false },
  { code: "JF02", name: "殷巷探店王", campus: "J", category: "F", conditionDesc: "殷巷商业街打卡 10 家店", humorDesc: "你的殷巷足迹覆盖了整条街，连街角的奶茶店都送你终身 8 折", unlocked: false },
  { code: "JF03", name: "橘园夜宵王", campus: "J", category: "F", conditionDesc: "橘园夜宵档口吃过 15 次", humorDesc: "凌晨的橘园你比保安还熟，夜宵摊老板给你留了专属座位", unlocked: false },
  { code: "JH01", name: "校歌一遍过", campus: "J", category: "H", conditionDesc: "一字不差唱完校歌", humorDesc: "你 K 歌新曲库 +1 东南大学校歌，朋友让你别再唱了", unlocked: false },
  { code: "JH02", name: "止于至善", campus: "J", category: "H", conditionDesc: "在校园内集齐止于至善 4 字拓印", humorDesc: "这 4 个字你临摹了 100 遍，连书法协会都想收你", unlocked: false },
  { code: "JH03", name: "东大人认证", campus: "J", category: "H", conditionDesc: "完成新生入学典礼后获得", humorDesc: "拿到学生证那一刻，你的人生履历上多了东大两个字，简历正式开光", unlocked: true, unlockedAt: "2025-09-01" },
  // D 丁家桥
  { code: "DL01", name: "丁家桥学神", campus: "D", category: "L", conditionDesc: "期末成绩单 GPA 满绩", humorDesc: "你的 GPA 让教务处打印机的墨水都紧张，全校第一排不上号至少是个传说", unlocked: false },
  { code: "DL02", name: "基础自习室钉子户", campus: "D", category: "L", conditionDesc: "在丁家桥基础自习室累计 50 小时", humorDesc: "自习室的椅子被你的体温捂热了 50 小时，管理员说这是它最辉煌的 50 小时", unlocked: false },
  { code: "DI01", name: "丁家桥老友", campus: "D", category: "I", conditionDesc: "在丁家桥认识 3 个长期搭子", humorDesc: "丁家桥的食堂咖啡馆成了你第二个客厅，老板以为你住附近", unlocked: false },
  { code: "DM01", name: "玄武湖晨跑", campus: "D", category: "M", conditionDesc: "完成 1 次玄武湖晨跑", humorDesc: "你在玄武湖边看日出，看湖的老人对你说年轻人真有精神", unlocked: false },
  { code: "DF01", name: "丁家桥食堂王", campus: "D", category: "F", conditionDesc: "食堂全菜系打卡", humorDesc: "你吃遍食堂所有窗口，连新来的厨师都来问你哪道最稳定", unlocked: false },
  { code: "DF02", name: "小红山早茶客", campus: "D", category: "F", conditionDesc: "小红山附近早茶店打卡 5 次", humorDesc: "早茶店老板已经把加蛋加肠记成你的默认配置", unlocked: false },
  { code: "DH01", name: "医学生誓言", campus: "D", category: "H", conditionDesc: "重温医学生誓言并录音", humorDesc: "你的誓言被自己听到第二遍，连路过的小狗都肃然起敬", unlocked: false },
  { code: "DH02", name: "丁家桥老校友", campus: "D", category: "H", conditionDesc: "听 1 位丁家桥老校友讲一次校史", humorDesc: "你坐在老校友对面，听他讲完 50 年，听懂了医德两个字怎么写", unlocked: false },
  // C 跨校区
  { code: "CL01", name: "三校区图书馆全打卡", campus: "C", category: "L", conditionDesc: "三个校区图书馆都签到", humorDesc: "你的图书馆借阅卡上 3 个校区的章集齐，图书管理员集体为你打 call", unlocked: false },
  { code: "CL02", name: "校车蹭课王", campus: "C", category: "L", conditionDesc: "跨校区蹭课 5 次", humorDesc: "你的课表上出现了 3 个校区的教室，老师以为你是交换生", unlocked: false },
  { code: "CI01", name: "三校区搭子", campus: "C", category: "I", conditionDesc: "在 3 个校区都有搭子", humorDesc: "你的微信定位一会儿四牌楼一会儿九龙湖一会儿丁家桥，警察叔叔表示关注", unlocked: false },
  { code: "CI02", name: "校车情缘", campus: "C", category: "I", conditionDesc: "在校车上认识 1 个新朋友", humorDesc: "一次校车坐出爱情故事，对方成了你的毕生搭子", unlocked: false },
  { code: "CI03", name: "搭子宇宙中心", campus: "C", category: "I", conditionDesc: "校内搭子数达到 20 人", humorDesc: "你的搭子比某些人的朋友还多，他们私下叫你东大社交天花板", unlocked: false },
  { code: "CM01", name: "南京地铁探索者", campus: "C", category: "M", conditionDesc: "乘坐南京地铁 10 条线路", humorDesc: "你的南京地铁卡刷成了金卡，进站闸机都对你点头", unlocked: false },
  { code: "CM02", name: "三校区 city walk", campus: "C", category: "M", conditionDesc: "一天内走完 3 个校区", humorDesc: "你的微信步数当天破 5 万，朋友圈直接爆了，室友以为你出事了", unlocked: false },
  { code: "CM03", name: "东大边界探索者", campus: "C", category: "M", conditionDesc: "解锁东大所有隐藏边界", humorDesc: "你比保安还清楚学校的每个角落，保安队长想挖你", unlocked: false },
  { code: "CF01", name: "南京吃货", campus: "C", category: "F", conditionDesc: "吃遍南京 5 大老字号", humorDesc: "你的大众点评有 200+ 收藏，卫岗牛奶都知道你的名字", unlocked: false },
  { code: "CF02", name: "三校区食堂王者", campus: "C", category: "F", conditionDesc: "三个校区食堂全部集齐徽章", humorDesc: "你的饭卡在三个校区都成了 VIP 客户，食堂阿姨叫得出你姓名", unlocked: false },
  { code: "CH01", name: "东南精神继承者", campus: "C", category: "H", conditionDesc: "解锁所有 SH+JH+DH 徽章", humorDesc: "14 个文化类徽章发光环绕你，你已经站在了止于至善的门口", unlocked: false },
  { code: "CH02", name: "东大老照片收藏家", campus: "C", category: "H", conditionDesc: "收集 10 张东大老照片", humorDesc: "你的相册里有一整个东大百年史，老教授们看着你发来点赞", unlocked: false },
]

export const campusLabel: Record<string, string> = { S: "四牌楼", J: "九龙湖", D: "丁家桥", C: "跨校区" }
export const categoryLabel: Record<string, string> = { L: "学习", I: "互动", M: "里程", F: "美食", H: "文化" }

export const CAMPUSES = ["S", "J", "D", "C"] as const
export const CATEGORIES = ["L", "I", "M", "F", "H"] as const
