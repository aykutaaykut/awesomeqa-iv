from typing import Annotated
import uvicorn
from fastapi import Depends, FastAPI, Path, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from dotenv import load_dotenv
import os

from app.repositories.ticket_repository import TicketRepository
from app.models import Status


ENV = "dev"


load_dotenv(f".env.{ENV}")
HOST = os.getenv("HOST")
BACKEND_PORT = int(os.getenv("BACKEND_PORT"))
FRONTEND_PORT = int(os.getenv("FRONTEND_PORT"))

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
    "/stats",
    tags=["statistic"],
    description="Gets the total number of tickets in each status.",
    status_code=status.HTTP_200_OK,
    response_description="Dictionary containing the total number of tickets in each status.",
)
async def get_total_number_of_tickets(
    *,
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    total_tickets = ticket_repository.get_total_number_of_tickets()
    return JSONResponse(total_tickets, status_code=200)


@app.get(
    "/tickets",
    tags=["ticket"],
    description=(
        "Gets at most `limit` tickets after skipping `skip` tickets and applying `status` filter."
    ),
    status_code=status.HTTP_200_OK,
    response_description="Dictionary containing the list of tickets in interest.",
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Ticket message not found."},
    },
)
async def get_tickets(
    *,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int | None, Query(ge=0, le=100)] = 20,
    status: list[Status] = Query(None),
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    tickets = ticket_repository.get_tickets_with_message(skip, limit, status)
    return JSONResponse(jsonable_encoder(tickets), status_code=200)


@app.get(
    "/ticket/{ticket_id}/context-messages",
    tags=["ticket"],
    description="Gets the ticket context messages with the given `ticket_id`.",
    status_code=status.HTTP_200_OK,
    response_description="Context messages belonging to the ticket with the given `ticket_id`.",
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Ticket not found."},
    },
)
async def get_ticket_context_messages(
    *,
    ticket_id: Annotated[str, Path(...)],
    ticket_repository: TicketRepository = Depends(lambda: ticket_repository),
):
    context_messages = ticket_repository.get_ticket_context_messages(ticket_id)
    return JSONResponse(jsonable_encoder(context_messages), status_code=200)


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


if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=BACKEND_PORT, reload=True)
