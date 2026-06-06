"""种子数据 — 预置假用户 + 攻略 + 破冰题"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
from models.user import User
from models.guide import Guide
from models.question import Question
from services.auth_service import hash_password

# ── 创建数据库表 ──
Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("🌱 开始种子数据初始化...")

# ────────────────────────────
# 1. 种子用户 (20个)
# ────────────────────────────
users_data = [
    {"studentId": "213200001", "nickname": "三三", "realName": "张三", "college": "信息科学与工程学院",
     "major": "信息工程", "campus": "jiulonghu", "gender": "male",
     "tags": ["自习", "跑步", "王者荣耀"], "bio": "寻找一起自习的搭子~"},
    {"studentId": "213200002", "nickname": "思思", "realName": "李思", "college": "建筑学院",
     "major": "建筑学", "campus": "sipailou", "gender": "female",
     "tags": ["咖啡", "摄影", "CityWalk"], "bio": "画图之余想找人一起喝咖啡"},
    {"studentId": "213200003", "nickname": "大刘", "realName": "刘大", "college": "土木工程学院",
     "major": "土木工程", "campus": "jiulonghu", "gender": "male",
     "tags": ["篮球", "健身", "游戏"], "bio": "找球友，每周打两次"},
    {"studentId": "213200004", "nickname": "小雪", "realName": "王雪", "college": "外国语学院",
     "major": "英语", "campus": "jiulonghu", "gender": "female",
     "tags": ["读书", "电影", "旅行"], "bio": "喜欢安静的生活，偶尔出去旅行"},
    {"studentId": "213200005", "nickname": "阿杰", "realName": "陈杰", "college": "计算机科学与工程学院",
     "major": "计算机科学", "campus": "jiulonghu", "gender": "male",
     "tags": ["编程", "开源", "跑步", "摄影"], "bio": "全栈开发，喜欢开源社区"},
    {"studentId": "213200006", "nickname": "小美", "realName": "赵美", "college": "艺术学院",
     "major": "美术学", "campus": "jiulonghu", "gender": "female",
     "tags": ["绘画", "摄影", "音乐", "CityWalk"], "bio": "艺术学院大三，喜欢用画笔记录生活"},
    {"studentId": "213200007", "nickname": "老周", "realName": "周伟", "college": "机械工程学院",
     "major": "机械工程", "campus": "jiulonghu", "gender": "male",
     "tags": ["骑行", "摄影", "美食", "跑步"], "bio": "骑行爱好者，周末常常环湖"},
    {"studentId": "213200008", "nickname": "小红", "realName": "孙红", "college": "经济管理学院",
     "major": "经济学", "campus": "jiulonghu", "gender": "female",
     "tags": ["瑜伽", "读书", "美食", "电影"], "bio": "喜欢瑜伽和美食探店"},
    {"studentId": "213200009", "nickname": "小明", "realName": "钱明", "college": "信息科学与工程学院",
     "major": "通信工程", "campus": "jiulonghu", "gender": "male",
     "tags": ["游戏", "编程", "动漫", "桌游"], "bio": "二次元+技术宅，想找到同好"},
    {"studentId": "213200010", "nickname": "小雨", "realName": "林雨", "college": "医学院",
     "major": "临床医学", "campus": "dingjiaqiao", "gender": "female",
     "tags": ["阅读", "跑步", "音乐", "自习"], "bio": "医学生日常，图书馆常驻选手"},
    {"studentId": "213200011", "nickname": "阿东", "realName": "黄东", "college": "材料科学与工程学院",
     "major": "材料科学", "campus": "jiulonghu", "gender": "male",
     "tags": ["篮球", "骑行", "电影", "美食"], "bio": "热爱运动，周末喜欢骑行探索南京"},
    {"studentId": "213200012", "nickname": "静静", "realName": "吴静", "college": "法学院",
     "major": "法学", "campus": "jiulonghu", "gender": "female",
     "tags": ["读书", "辩论", "电影", "旅行"], "bio": "法学生，平时喜欢看书和看电影"},
    {"studentId": "213200013", "nickname": "老王", "realName": "冯强", "college": "数学学院",
     "major": "数学", "campus": "jiulonghu", "gender": "male",
     "tags": ["桌游", "编程", "音乐", "游戏"], "bio": "数学爱好者，也喜欢音乐和桌游"},
    {"studentId": "213200014", "nickname": "花花", "realName": "陈花", "college": "建筑学院",
     "major": "城市规划", "campus": "sipailou", "gender": "female",
     "tags": ["CityWalk", "摄影", "咖啡", "旅行"], "bio": "喜欢在城市里漫步，发现风景"},
    {"studentId": "213200015", "nickname": "阿文", "realName": "褚文", "college": "电子科学与工程学院",
     "major": "电子信息", "campus": "jiulonghu", "gender": "male",
     "tags": ["编程", "跑步", "健身", "游戏"], "bio": "电子人，也爱运动和游戏"},
    {"studentId": "213200016", "nickname": "月月", "realName": "魏月", "college": "人文学院",
     "major": "汉语言文学", "campus": "jiulonghu", "gender": "female",
     "tags": ["写作", "读书", "电影", "旅行"], "bio": "中文系，热爱文字和电影"},
    {"studentId": "213200017", "nickname": "阿辉", "realName": "蒋辉", "college": "土木工程学院",
     "major": "给排水", "campus": "jiulonghu", "gender": "male",
     "tags": ["篮球", "跑步", "美食", "旅行"], "bio": "爱打球爱跑步，周末喜欢出去吃好吃的"},
    {"studentId": "213200018", "nickname": "娜娜", "realName": "沈娜", "college": "化学化工学院",
     "major": "化学", "campus": "jiulonghu", "gender": "female",
     "tags": ["烘焙", "自习", "电影", "音乐"], "bio": "实验室之外，喜欢烘焙和看电影"},
    {"studentId": "213200019", "nickname": "小胖", "realName": "韩亮", "college": "计算机科学与工程学院",
     "major": "人工智能", "campus": "jiulonghu", "gender": "male",
     "tags": ["编程", "开源", "游戏", "桌游"], "bio": "AI 方向研究生，偶尔打打游戏"},
    {"studentId": "213200020", "nickname": "小雅", "realName": "杨雅", "college": "外国语学院",
     "major": "日语", "campus": "jiulonghu", "gender": "female",
     "tags": ["日语", "动漫", "旅行", "美食"], "bio": "日语专业，喜欢动漫和日本文化"},
]

user_ids = {}
for i, u in enumerate(users_data):
    user = User(
        studentId=u["studentId"],
        realName=u["realName"],
        idCardLast6=f"{i+1:06d}",
        passwordHash=hash_password("123456"),
        nickname=u["nickname"],
        college=u["college"],
        major=u["major"],
        grade="2024" if i < 10 else "2023",
        campus=u["campus"],
        gender=u["gender"],
        tags=u["tags"],
        bio=u.get("bio"),
        creditScore=85 if i % 5 != 0 else 75,
        points=100 + i * 10,
    )
    db.add(user)
    user_ids[u["nickname"]] = user

db.commit()

# 刷新获取 ID
for nickname, user in user_ids.items():
    db.refresh(user)
    user_ids[nickname] = user.id

print(f"  ✅ 创建了 {len(users_data)} 个种子用户")

# ────────────────────────────
# 2. 种子攻略 (5篇)
# ────────────────────────────
guides_data = [
    {
        "title": "九龙湖情侣限定一日游",
        "description": "从李文正图书馆出发，先一起看一小时书，感受对方的学习状态。\n\n然后步行到橘园食堂吃午饭，推荐酸菜鱼和水煮肉片。\n\n饭后去九龙湖湿地公园环湖散步，可以聊聊彼此的兴趣爱好。\n\n傍晚去体育馆打羽毛球或乒乓球，运动后一起去梅园吃晚饭。\n\n这是最适合初识的约会路线，节奏轻松，有足够多的话题触发点。",
        "category": "date",
        "price": 5,
        "tags": ["散步", "美食", "图书馆", "运动"],
        "suitableFor": "couple",
        "budget": 50,
        "route": {
            "points": [
                {"lat": 31.8912, "lng": 118.8118, "name": "李文正图书馆", "desc": "起点，一起看书1h", "stayMin": 60},
                {"lat": 31.8935, "lng": 118.8150, "name": "橘园食堂", "desc": "午饭，推荐酸菜鱼", "stayMin": 30},
                {"lat": 31.8960, "lng": 118.8180, "name": "九龙湖湿地公园", "desc": "环湖散步聊天", "stayMin": 45},
                {"lat": 31.8900, "lng": 118.8130, "name": "体育馆", "desc": "羽毛球/乒乓球", "stayMin": 60},
                {"lat": 31.8920, "lng": 118.8140, "name": "梅园食堂", "desc": "晚餐", "stayMin": 30},
            ]
        },
        "author_idx": 0,  # 三三
    },
    {
        "title": "四牌楼文艺美食探店全攻略",
        "description": "从校门口梧桐大道出发，秋天的梧桐叶是最美的背景。\n\n先去大礼堂打卡拍照，这是东大最具代表性的建筑之一。\n\n然后去前工院旁边的「老门东咖啡」，建筑系学生的秘密基地。\n\n中午去沙塘园食堂吃隐藏菜品——糖醋排骨和狮子头必点。\n\n下午去孟芳图书馆门口拍毕业照同款位置，再去六朝松感受千年历史。",
        "category": "food",
        "price": 3,
        "tags": ["美食", "摄影", "CityWalk", "咖啡"],
        "suitableFor": "any",
        "budget": 30,
        "route": {
            "points": [
                {"lat": 32.0577, "lng": 118.7888, "name": "校门口梧桐大道", "desc": "起点，拍照打卡", "stayMin": 15},
                {"lat": 32.0570, "lng": 118.7895, "name": "大礼堂", "desc": "标志性建筑打卡", "stayMin": 20},
                {"lat": 32.0565, "lng": 118.7890, "name": "老门东咖啡", "desc": "建筑系学生聚集地", "stayMin": 45},
                {"lat": 32.0568, "lng": 118.7885, "name": "沙塘园食堂", "desc": "糖醋排骨+狮子头", "stayMin": 30},
                {"lat": 32.0573, "lng": 118.7892, "name": "孟芳图书馆", "desc": "打卡拍照", "stayMin": 20},
                {"lat": 32.0560, "lng": 118.7880, "name": "六朝松", "desc": "千年古树", "stayMin": 15},
            ]
        },
        "author_idx": 1,  # 思思
    },
    {
        "title": "跨校区骑行：九龙湖→四牌楼",
        "description": "从九龙湖校区出发，沿机场高速辅路一路骑行到四牌楼校区，全程约25公里。\n\n这是东大学子最经典的跨校区骑行路线，沿途经过百家湖、南京南站、雨花台。\n\n建议早8点出发，中午到达四牌楼正好吃午饭。\n\n骑行难度中等，有部分上坡，需要一定的体能基础。",
        "category": "cross_campus",
        "price": 3,
        "tags": ["骑行", "运动", "探索"],
        "suitableFor": "group",
        "budget": 20,
        "route": {
            "points": [
                {"lat": 31.8912, "lng": 118.8118, "name": "九龙湖校区北门", "desc": "起点", "stayMin": 0},
                {"lat": 31.9050, "lng": 118.8050, "name": "百家湖", "desc": "第一个休息点", "stayMin": 10},
                {"lat": 31.9700, "lng": 118.7950, "name": "南京南站", "desc": "第二个休息点", "stayMin": 10},
                {"lat": 32.0100, "lng": 118.7800, "name": "雨花台", "desc": "第三个休息点", "stayMin": 15},
                {"lat": 32.0577, "lng": 118.7888, "name": "四牌楼校区", "desc": "终点！吃午饭", "stayMin": 60},
            ]
        },
        "author_idx": 6,  # 老周
    },
    {
        "title": "学霸专属：通宵自习室+熬夜指南",
        "description": "考试周专属攻略。\n\n九龙湖校区有多个通宵自习点：李文正图书馆三楼（到22:30）、教学楼部分教室（通宵开放）、橘园宿舍楼下的自习室。\n\n推荐路线：下午在图书馆高效学习，晚饭后转战教学楼通宵教室，凌晨三点去711买夜宵补充能量。\n\n必备物品：充电宝、保温杯、颈枕、眼药水。",
        "category": "study",
        "price": 0,
        "tags": ["自习", "期末", "考试"],
        "suitableFor": "solo",
        "budget": 20,
        "route": {
            "points": [
                {"lat": 31.8912, "lng": 118.8118, "name": "李文正图书馆三楼", "desc": "下午高效学习", "stayMin": 240},
                {"lat": 31.8920, "lng": 118.8130, "name": "教学楼通宵教室", "desc": "晚上继续", "stayMin": 360},
                {"lat": 31.8930, "lng": 118.8140, "name": "711便利店", "desc": "凌晨补给", "stayMin": 15},
            ]
        },
        "author_idx": 9,  # 小雨
    },
    {
        "title": "紫金山夜爬+日出攻略",
        "description": "南京大学生必做的100件事之一：紫金山夜爬看日出！\n\n凌晨3点从白马公园入口上山，约1.5小时登顶头陀岭。\n\n建议携带手电筒/头灯、防风外套、水和少量食物。\n\n登顶后在山顶等日出（夏天约5:00、冬天约6:30），日出后下山在紫金山庄吃早餐。\n\n⚠️ 安全第一：结伴同行、走主路、注意脚下。",
        "category": "outing",
        "price": 5,
        "tags": ["爬山", "日出", "户外", "冒险"],
        "suitableFor": "group",
        "budget": 30,
        "route": {
            "points": [
                {"lat": 32.0660, "lng": 118.8350, "name": "白马公园", "desc": "登山起点", "stayMin": 0},
                {"lat": 32.0700, "lng": 118.8400, "name": "紫金山天文台", "desc": "中途休息点", "stayMin": 15},
                {"lat": 32.0740, "lng": 118.8450, "name": "头陀岭", "desc": "山顶等日出！", "stayMin": 60},
                {"lat": 32.0680, "lng": 118.8380, "name": "紫金山庄", "desc": "早餐", "stayMin": 30},
            ]
        },
        "author_idx": 10,  # 阿东
    },
]

guide_ids = []
for g in guides_data:
    author_nickname = users_data[g["author_idx"]]["nickname"]
    author = db.query(User).filter(User.nickname == author_nickname).first()
    guide = Guide(
        authorId=author.id if author else "seed-default",
        title=g["title"],
        description=g["description"],
        category=g["category"],
        price=g["price"],
        tags=g["tags"],
        suitableFor=g.get("suitableFor", "any"),
        budget=g.get("budget"),
        route=g["route"],
        sales=g["author_idx"] * 15 + 20,  # 随机的销量
        avgRating=round(4.0 + (g["author_idx"] % 5) * 0.2, 1),
    )
    db.add(guide)
    guide_ids.append(guide)

db.commit()
print(f"  ✅ 创建了 {len(guides_data)} 篇种子攻略")

# ────────────────────────────
# 3. 种子破冰题 (20道)
# ────────────────────────────
questions_data = [
    # 价值观
    {"category": "values", "content": "你认为大学里最重要的是什么？"},
    {"category": "values", "content": "如果可以改变世界的一件事，你最想改变什么？"},
    {"category": "values", "content": "你对'成功'的定义是什么？"},
    {"category": "values", "content": "在友情和利益之间，你会如何选择？"},
    # 生活方式
    {"category": "lifestyle", "content": "周末通常会怎么度过？"},
    {"category": "lifestyle", "content": "你喜欢早起还是熬夜？为什么？"},
    {"category": "lifestyle", "content": "你理想中的一天是怎样的？"},
    # 兴趣爱好
    {"category": "interest", "content": "最近在循环播放的一首歌是什么？"},
    {"category": "interest", "content": "如果可以瞬间掌握一项技能，你会选什么？"},
    {"category": "interest", "content": "你最近在看的一本书/一部剧是什么？"},
    # 趣味脑洞
    {"category": "fun", "content": "如果明天是世界末日，今天你会做什么？"},
    {"category": "fun", "content": "如果你有一只宠物龙，你会给它取什么名字？"},
    {"category": "fun", "content": "超能力二选一：会飞还是会隐身？"},
    # 东大专享
    {"category": "seu", "content": "你在东大最喜欢的一个角落是哪里？"},
    {"category": "seu", "content": "在东大吃过最好吃的一道菜是什么？"},
    {"category": "seu", "content": "如果给新生一个建议，你会说什么？"},
    # 社交期待
    {"category": "expectation", "content": "你下载这个 App 最想找到什么？"},
    {"category": "expectation", "content": "你理想中的搭子是什么样的？"},
    {"category": "expectation", "content": "你觉得两个人合拍最重要的是什么？"},
    {"category": "expectation", "content": "你最不能接受朋友/伴侣的什么行为？"},
]

for q in questions_data:
    db.add(Question(category=q["category"], content=q["content"]))

db.commit()
print(f"  ✅ 创建了 {len(questions_data)} 道种子破冰题")

# ────────────────────────────
# 4. 种子广场帖子 (5条)
# ────────────────────────────
from models.plaza import PlazaPost, PlazaParticipant

plaza_posts = [
    {
        "title": "今晚图书馆自习搭子",
        "category": "study",
        "status": "recruiting",
        "time": "今天 19:00-22:00",
        "place": "九龙湖图书馆 · 研习区",
        "capacity": 6,
        "note": "一起专注学习，互相监督，效率翻倍。",
        "author_idx": 0,
    },
    {
        "title": "周三下午羽毛球",
        "category": "sport",
        "status": "recruiting",
        "time": "周三 15:00-17:00",
        "place": "九龙湖体育馆 · 羽毛球场",
        "capacity": 4,
        "note": "找羽毛球搭子，水平一般般，主要是锻炼身体。",
        "author_idx": 2,
    },
    {
        "title": "周末四牌楼CityWalk",
        "category": "life",
        "status": "recruiting",
        "time": "周六 14:00-17:00",
        "place": "四牌楼校区 · 大礼堂门口集合",
        "capacity": 5,
        "note": "一起走走四牌楼，拍拍梧桐大道，喝喝咖啡。",
        "author_idx": 1,
    },
    {
        "title": "摄影小分队——紫金山日落",
        "category": "interest",
        "status": "recruiting",
        "time": "周日 16:00-19:00",
        "place": "紫金山天文台",
        "capacity": 4,
        "note": "摄影爱好者组队拍紫金山日落，设备不限，手机也行。",
        "author_idx": 6,
    },
    {
        "title": "期末高数复习组",
        "category": "study",
        "status": "recruiting",
        "time": "每天 18:00-22:00",
        "place": "九龙湖图书馆三楼",
        "capacity": 8,
        "note": "期末高数复习搭子，一起刷题，互相答疑。",
        "author_idx": 12,
    },
]

for pp in plaza_posts:
    author_nickname = users_data[pp["author_idx"]]["nickname"]
    author = db.query(User).filter(User.nickname == author_nickname).first()
    post = PlazaPost(
        authorId=author.id,
        title=pp["title"],
        category=pp["category"],
        status=pp["status"],
        time=pp["time"],
        place=pp["place"],
        capacity=pp["capacity"],
        joined=pp.get("joined", 1),
        note=pp["note"],
    )
    db.add(post)
    db.flush()
    # 作者自动加入自己的帖子
    db.add(PlazaParticipant(postId=post.id, userId=author.id, status="joined"))

db.commit()
print(f"  ✅ 创建了 {len(plaza_posts)} 条种子广场帖子")

# ────────────────────────────
# 5. 种子路线 (3条)
# ────────────────────────────
from models.route import CampusRoute, RouteStep

route_data = [
    {
        "title": "九龙湖学习搭子路线",
        "badge": "官方路线",
        "campus": "九龙湖",
        "duration": "约 1 天",
        "difficulty": "轻松",
        "participantCount": 1200,
        "nodeCount": 5,
        "coverImage": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400",
        "intro": "从图书馆到教学楼，串起一次温和的共同学习行动。",
        "tags": ["自习", "图书馆", "守约"],
        "steps": [
            {"title": "图书馆入口集合", "desc": "在公共空间完成队伍确认，开启路线。", "method": "扫码打卡"},
            {"title": "研习区专注时段", "desc": "完成 45 分钟共同学习。", "method": "计时打卡"},
            {"title": "咖啡休息", "desc": "去图书馆咖啡吧休息15分钟，互相交流。", "method": "扫码打卡"},
            {"title": "教学楼自习", "desc": "转移到教学楼自习室继续学习。", "method": "扫码打卡"},
            {"title": "总结交流", "desc": "分享当天的学习收获和心得。", "method": "拍照打卡"},
        ],
    },
    {
        "title": "四牌楼文艺探索路线",
        "badge": "官方路线",
        "campus": "四牌楼",
        "duration": "约 半天",
        "difficulty": "轻松",
        "participantCount": 850,
        "nodeCount": 4,
        "coverImage": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
        "intro": "漫步百年校园，发现那些藏在角落里的故事。",
        "tags": ["摄影", "历史", "CityWalk"],
        "steps": [
            {"title": "校门口梧桐大道", "desc": "从标志性的梧桐大道开始旅程。", "method": "拍照打卡"},
            {"title": "大礼堂打卡", "desc": "参观大礼堂，了解百年校史。", "method": "扫码打卡"},
            {"title": "孟芳图书馆", "desc": "在图书馆门口拍摄毕业照同款位置。", "method": "拍照打卡"},
            {"title": "六朝松", "desc": "找到千年古树六朝松并拍照。", "method": "拍照打卡"},
        ],
    },
    {
        "title": "丁家桥医学健康路线",
        "badge": "用户路线",
        "campus": "丁家桥",
        "duration": "约 2 小时",
        "difficulty": "中等",
        "participantCount": 320,
        "nodeCount": 3,
        "coverImage": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
        "intro": "探索丁家桥校区，了解医学健康知识。",
        "tags": ["医学", "健康", "探索"],
        "steps": [
            {"title": "医学院大厅集合", "desc": "在医学院大厅进行路线说明和安全须知。", "method": "扫码打卡"},
            {"title": "人体科学馆参观", "desc": "参观人体科学馆，了解人体结构。", "method": "计时打卡"},
            {"title": "综合楼健康讲座", "desc": "参加健康知识小讲座。", "method": "扫码打卡"},
        ],
    },
]

for rd in route_data:
    route = CampusRoute(
        title=rd["title"],
        badge=rd["badge"],
        campus=rd["campus"],
        duration=rd["duration"],
        difficulty=rd["difficulty"],
        participantCount=rd["participantCount"],
        nodeCount=rd["nodeCount"],
        coverImage=rd["coverImage"],
        intro=rd["intro"],
        tags=rd["tags"],
    )
    db.add(route)
    db.flush()
    for i, step in enumerate(rd["steps"]):
        db.add(RouteStep(
            routeId=route.id,
            title=step["title"],
            desc=step["desc"],
            method=step["method"],
            sortOrder=i,
        ))

db.commit()
print(f"  ✅ 创建了 {len(route_data)} 条种子路线")

print("\n🎉 种子数据初始化完成！")
print(f"   默认密码: 123456")
print(f"   学号范围: 213200001 - 213200020")
db.close()
