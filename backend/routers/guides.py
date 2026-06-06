"""攻略路由 — GET/POST /guides/*"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models.guide import Guide
from models.user import User
from models.purchase import Purchase
from schemas import ok, error
from schemas.guide import CreateGuideRequest, UpdateGuideRequest
from routers.auth_deps import get_current_user
from services.points_service import deduct_points, add_points

router = APIRouter()


@router.get("")
async def list_guides(
    category: str = Query(None),
    campus: str = Query(None),
    tags: str = Query(None),
    sort: str = Query("popular"),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(Guide).filter(Guide.status == "published")

    if category:
        query = query.filter(Guide.category == category)
    if search:
        query = query.filter(Guide.title.contains(search))
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        # SQLite JSON 查询 — 简化处理
        for tag in tag_list:
            query = query.filter(Guide.tags.contains(tag))

    # 排序
    if sort == "new":
        query = query.order_by(desc(Guide.createdAt))
    elif sort == "rating":
        query = query.order_by(desc(Guide.avgRating))
    else:  # popular
        query = query.order_by(desc(Guide.sales))

    total = query.count()
    guides = query.offset((page - 1) * pageSize).limit(pageSize).all()

    list_data = []
    for g in guides:
        author = db.query(User).filter(User.id == g.authorId).first()
        list_data.append({
            "id": g.id,
            "title": g.title,
            "coverImage": g.coverImage,
            "category": g.category,
            "tags": g.tags or [],
            "price": g.price,
            "sales": g.sales,
            "avgRating": g.avgRating,
            "author": {
                "id": author.id if author else "",
                "nickname": author.nickname if author else "未知",
                "avatar": author.avatar if author else None,
            },
            "createdAt": g.createdAt.isoformat() if g.createdAt else None,
        })

    return ok({
        "list": list_data,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "hasMore": (page * pageSize) < total,
    })


@router.get("/{guide_id}")
async def get_guide(
    guide_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        return error(10004, "攻略不存在")

    author = db.query(User).filter(User.id == guide.authorId).first()

    # 检查是否已购买
    purchase = db.query(Purchase).filter(
        Purchase.buyerId == current_user.id,
        Purchase.guideId == guide_id,
        Purchase.refunded == False,
    ).first()

    purchased = purchase is not None
    can_refund = purchased and not purchase.refunded if purchase else False

    # 未购买时截断描述
    description = guide.description
    if not purchased and guide.price > 0:
        cutoff = len(description) // 3
        description = description[:cutoff] + "\n\n[购买后查看完整内容...]"

    return ok({
        "id": guide.id,
        "title": guide.title,
        "description": description,
        "category": guide.category,
        "coverImage": guide.coverImage,
        "images": guide.images or [],
        "route": guide.route or {},
        "budget": guide.budget,
        "suitableFor": guide.suitableFor,
        "tags": guide.tags or [],
        "price": guide.price,
        "sales": guide.sales,
        "avgRating": guide.avgRating,
        "status": guide.status,
        "author": {
            "id": author.id if author else "",
            "nickname": author.nickname if author else "未知",
            "avatar": author.avatar if author else None,
        },
        "purchased": purchased,
        "canRefund": can_refund,
        "createdAt": guide.createdAt.isoformat() if guide.createdAt else None,
    })


@router.post("")
async def create_guide(
    body: CreateGuideRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    guide = Guide(
        authorId=current_user.id,
        title=body.title,
        description=body.description,
        category=body.category,
        coverImage=body.coverImage,
        images=body.images,
        route=body.route.model_dump() if body.route else {},
        budget=body.budget,
        suitableFor=body.suitableFor,
        tags=body.tags,
        price=body.price,
    )
    db.add(guide)
    db.commit()
    db.refresh(guide)

    # 发布攻略 +3 积分
    current_user.points += 3
    db.commit()

    return ok({
        "id": guide.id,
        "title": guide.title,
        "status": guide.status,
        "createdAt": guide.createdAt.isoformat() if guide.createdAt else None,
    })


@router.put("/{guide_id}")
async def update_guide(
    guide_id: str,
    body: UpdateGuideRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        return error(10004, "攻略不存在")
    if guide.authorId != current_user.id:
        return error(10003, "只能编辑自己的攻略")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "route" and value:
            value = value.model_dump()
        setattr(guide, key, value)

    db.commit()
    return ok({"id": guide.id, "updated": True})


@router.post("/{guide_id}/purchase")
async def purchase_guide(
    guide_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    guide = db.query(Guide).filter(Guide.id == guide_id, Guide.status == "published").first()
    if not guide:
        return error(10004, "攻略不存在")

    # 检查是否已购买
    existing = db.query(Purchase).filter(
        Purchase.buyerId == current_user.id,
        Purchase.guideId == guide_id,
        Purchase.refunded == False,
    ).first()
    if existing:
        return error(10005, "您已购买过此攻略")

    # 扣积分
    if current_user.points < guide.price:
        return error(10011, f"积分不足，当前积分 {current_user.points}，需要 {guide.price} 积分")

    current_user.points -= guide.price
    purchase = Purchase(buyerId=current_user.id, guideId=guide_id, price=guide.price)
    guide.sales += 1

    # 作者加积分
    author = db.query(User).filter(User.id == guide.authorId).first()
    if author:
        author.points += guide.price

    db.add(purchase)
    db.commit()

    return ok({
        "purchaseId": purchase.id,
        "guideId": guide_id,
        "price": guide.price,
        "balanceAfter": current_user.points,
    })


@router.post("/{guide_id}/refund")
async def refund_guide(
    guide_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    purchase = db.query(Purchase).filter(
        Purchase.buyerId == current_user.id,
        Purchase.guideId == guide_id,
        Purchase.refunded == False,
    ).first()
    if not purchase:
        return error(10004, "未找到购买记录")

    purchase.refunded = True
    current_user.points += purchase.price

    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if guide:
        guide.sales = max(0, guide.sales - 1)

    db.commit()
    return ok({"refunded": True, "balanceAfter": current_user.points})
