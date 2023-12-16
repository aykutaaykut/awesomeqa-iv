from fastapi import HTTPException


class AuthorNotFoundException(HTTPException):
    """
    Exception thrown when an author does not exist.
    """

    def __init__(self, message: str):
        """
        Initializes an AuthorNotFoundException.
        """
        super().__init__(status_code=404, detail="Author not found", headers={"X-Error": message})
