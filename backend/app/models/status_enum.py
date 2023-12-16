from enum import Enum


class Status(str, Enum):
    """
    Represents status of the ticket.

    Values:
    - OPEN = "open": Ticket is open.
    - RESOLVED = "resolved": Ticket is resolved.
    - DELETED = "deleted": Ticket is deleted.
    """

    OPEN = "open"
    RESOLVED = "resolved"
    DELETED = "deleted"
