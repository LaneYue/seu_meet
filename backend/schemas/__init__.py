"""统一响应格式"""

from typing import TypeVar, Generic

T = TypeVar("T")


def ok(data=None):
    return {"code": 0, "message": "ok", "data": data}


def error(code: int, message: str):
    return {"code": code, "message": message}


class PaginatedData(Generic[T]):
    def __init__(self, list_data: list[T], total: int, page: int, pageSize: int):
        self.list = list_data
        self.total = total
        self.page = page
        self.pageSize = pageSize
        self.hasMore = (page * pageSize) < total
