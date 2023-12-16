from fastapi import HTTPException


class TicketNotFoundException(HTTPException):
    """
    Exception thrown when a ticket does not exist.
    """

    def __init__(self, message: str):
        """
        Initializes a TicketNotFoundException.
        """
        super().__init__(
            status_code=404,
            detail="Ticket not found",
            headers={"X-Error": message}
        )
