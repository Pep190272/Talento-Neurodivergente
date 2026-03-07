"""Domain primitives shared across all bounded contexts."""

from .base_entity import BaseEntity
from .value_objects import Email, Score, UserRole, UserStatus, NeuroVector24D

__all__ = [
    "BaseEntity",
    "Email",
    "Score",
    "UserRole",
    "UserStatus",
    "NeuroVector24D",
]
