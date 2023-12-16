from pydantic import BaseModel
from datetime import datetime
from app.models.author_model import AuthorModel


class MessageModel(BaseModel):
    """
    Represents a message.

    Attributes:
    - id (str): ID of the message.
    - channel_id (str): ID of the channel.
    - parent_channel_id (str, optional): ID of the parent channel.
    - community_server_id (str, optional): ID of the community server.
    - timestamp (datetime): Message timestamp.
    - has_attachment (bool): Whether the message has attachment.
    - reference_msg_id (str, optional): ID of the reference message.
    - timestamp_insert (datetime): Message insert timestamp.
    - discussion_id (str, optional): ID of the discussion.
    - author_id (str): ID of the author.
    - content (str): Message content.
    - msg_url (str): URL of the message.
    - author (AuthorModel): Author of the message.
    """

    id: str
    channel_id: str
    parent_channel_id: str | None = None
    community_server_id: str | None = None
    timestamp: datetime
    has_attachment: bool
    reference_msg_id: str | None = None
    timestamp_insert: datetime
    discussion_id: str | None
    author_id: str
    content: str
    msg_url: str
    author: AuthorModel
