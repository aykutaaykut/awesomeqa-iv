from fastapi import HTTPException


class MessageNotFoundException(HTTPException):
    """
    Exception thrown when a message does not exist.
    """

    def __init__(self, message: str):
        """
        Initializes a MessageNotFoundException.
        """
        super().__init__(
            status_code=404,
            detail="Message not found",
            headers={"X-Error": message}
        )
