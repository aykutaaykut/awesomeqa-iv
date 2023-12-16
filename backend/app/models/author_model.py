from pydantic import BaseModel
from datetime import datetime


class AuthorModel(BaseModel):
    """
    Represents an author.

    Attributes:
    - id (str): ID of the author.
    - name (str): Name of the author.
    - nickname (str): Nickname of the author.
    - color (str): Hex color of the author.
    - discriminator (str): Discriminator of the author.
    - avatar_url (str): URL of the author avatar.
    - is_bot (bool): Whether the author is a bot.
    - timestamp_insert (datetime): Timestamp when the author was created.
    """
    id: str
    name: str
    nickname: str
    color: str
    discriminator: str
    avatar_url: str
    is_bot: bool
    timestamp_insert: datetime
