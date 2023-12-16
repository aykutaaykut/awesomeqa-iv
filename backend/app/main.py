from typing import Annotated
import uvicorn
from fastapi import Depends, FastAPI, Path, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from app.repositories.ticket_repository import TicketRepository
from app.models import Status


HOST = "localhost"
BACKEND_PORT = 5001
FRONTEND_PORT = 3000

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://{HOST}:{FRONTEND_PORT}"],
    allow_methods=["GET", "PUT", "DELETE"],
)

TICKET_FILEPATH = "../data/awesome_tickets.json"
ticket_repository = TicketRepository(filepath=TICKET_FILEPATH)


@app.get("/healthz")
async def root():
    return "OK"


@app.get(
    "/tickets",
    tags=["ticket"],
    description="""
        Gets at most `limit` tickets after skipping `skip` tickets and
        applying `status` filter along with the total number of tickets
        in each status.
        """,
    status_code=status.HTTP_200_OK,
    response_description=(
        "Dictionary containing the list of tickets in interest and the total number of tickets in"
        " each status."
    ),
)
async def get_tickets(
    *,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int | None, Query(ge=0, le=100)] = 20,
    status: list[Status] = Query(None),
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    tickets = ticket_repository.get_tickets(skip, limit, status)
    total_tickets = ticket_repository.get_total_number_of_tickets()
    return JSONResponse(
        {"tickets": jsonable_encoder(tickets), "totalTickets": total_tickets},
        status_code=200,
    )


@app.get(
    "/ticket/{ticket_id}",
    tags=["ticket"],
    description="Gets the ticket with the given `ticket_id`.",
    status_code=status.HTTP_200_OK,
    response_description="Ticket with the given `ticket_id`.",
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Ticket not found."},
    },
)
async def get_ticket(
    *,
    ticket_id: Annotated[str, Path(...)],
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    ticket = ticket_repository.get_ticket(ticket_id)
    return JSONResponse(jsonable_encoder(ticket), status_code=200)


@app.put(
    "/ticket/{ticket_id}",
    tags=["ticket"],
    description="Resolves the ticket with the given `ticket_id`.",
    status_code=status.HTTP_200_OK,
    response_description="Ticket resolved.",
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Ticket not found."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Save failed."},
    },
)
async def resolve_ticket(
    *,
    ticket_id: Annotated[str, Path(...)],
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    ticket = ticket_repository.resolve_ticket(ticket_id)
    return JSONResponse(jsonable_encoder(ticket), status_code=200)


@app.delete(
    "/ticket/{ticket_id}",
    tags=["ticket"],
    description="Deletes the ticket with the given `ticket_id`.",
    status_code=status.HTTP_200_OK,
    response_description="Ticket deleted.",
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Ticket not found."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Save failed."},
    },
)
async def delete_ticket(
    *,
    ticket_id: Annotated[str, Path(...)],
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    ticket = ticket_repository.delete_ticket(ticket_id)
    return JSONResponse(jsonable_encoder(ticket), status_code=200)


@app.get(
    "/ticket/{ticket_id}/message",
    tags=["ticket"],
    description="Gets the ticket message with the given `ticket_id`.",
    status_code=status.HTTP_200_OK,
    response_description="Ticket message with the given `ticket_id`.",
    responses={status.HTTP_404_NOT_FOUND: {"description": "Ticket/Message not found."}},
)
async def get_ticket_message(
    *,
    ticket_id: Annotated[str, Path(...)],
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    message = ticket_repository.get_ticket_message(ticket_id)
    return JSONResponse(jsonable_encoder(message), status_code=200)


@app.get(
    "/message/{message_id}",
    tags=["message"],
    description="Gets the message with the given `message_id`.",
    status_code=status.HTTP_200_OK,
    response_description="Message with the given `message_id`.",
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Message not found."},
    },
)
async def get_message(
    *,
    message_id: Annotated[str, Path(...)],
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    message = ticket_repository.get_message(message_id)
    return JSONResponse(jsonable_encoder(message), status_code=200)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=BACKEND_PORT, reload=True)
