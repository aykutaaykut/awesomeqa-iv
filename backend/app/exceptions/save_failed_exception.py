from fastapi import HTTPException


class SaveFailedException(HTTPException):
    """
    Exception thrown when an error occurs during data save.
    """

    def __init__(self, message: str):
        """
        Initializes a SaveFailedException.
        """
        super().__init__(
            status_code=500,
            detail="Save failed.",
            headers={"X-Error": message}
        )
