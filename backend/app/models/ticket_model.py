from pydantic import BaseModel
from datetime import datetime
from app.models.status_enum import Status


class TicketModel(BaseModel):
    """
    Represents a ticket.

    Attributes:
    - id (str): ID of the ticket.
    - msg_id (str): ID of the ticket message.
    - status (Status): Status of the ticket.
    - resolved_by (str, optional): ID of the moderator resolved the ticket.
    - ts_last_status_change (datetime, optional): Last status change timestamp.
    - timestamp (datetime): Ticket creation timestamp.
    - context_messages (list[str]): List of context message IDs.
    """

    id: str
    msg_id: str
    status: Status
    resolved_by: str | None = None
    ts_last_status_change: datetime | None = None
    timestamp: datetime
    context_messages: list[str]
