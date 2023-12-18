import json
from typing import Optional
from pydantic import TypeAdapter
from pydantic_core import to_jsonable_python
from datetime import datetime, timezone

from app.models import Status, TicketModel, MessageModel
from app.exceptions import (
    SaveFailedException,
    TicketNotFoundException,
    MessageNotFoundException,
)


class TicketRepository:
    """
    Repository for tickets.
    """

    def __init__(self, filepath: str):
        """
        Initializes a TicketRepository.
        """
        self.data_path = filepath

        with open(self.data_path, "r") as json_file:
            self.data = json.load(json_file)

        ticket_model_type_adapter = TypeAdapter(list[TicketModel])
        self.data["tickets"] = ticket_model_type_adapter.validate_python(self.data["tickets"])

        message_model_type_adapter = TypeAdapter(list[MessageModel])
        self.data["messages"] = message_model_type_adapter.validate_python(self.data["messages"])

    def save_data(self) -> None:
        """
        Saves the data in the data directory.

        Raises
        ------
        SaveFailedException
            Thrown if the data is not saved successfully.
        """
        try:
            with open(self.data_path, "w") as json_file:
                json.dump(self.data, json_file, indent=2, default=to_jsonable_python)
        except Exception as e:
            raise SaveFailedException(f"Error in saving data with the root error: {e}")

    def get_total_number_of_tickets(self) -> dict[Status, int]:
        """
        Returns the total number of tickets.

        Returns
        -------
        dict[Status, int]
            Total number of tickets with each status.
        """
        counts = {status.value: 0 for status in Status}
        for ticket in self.data["tickets"]:
            counts[ticket.status] += 1
        return counts

    def get_tickets_with_message(
        self,
        skip: Optional[int] = 0,
        limit: Optional[int] = None,
        status: Optional[list[Status]] = None,
    ) -> list[dict]:
        """
        Gets at most `limit` tickets after skipping `skip` tickets and applying `status` filter.

        Parameters
        ----------
        skip: int, default: 0
            Number of tickets to skip from the start.
        limit: int, optional
            Number of tickets to get at most. By default, all tickets are returned.
        status: list[str], optional
            Status of the tickets in interest, used for filtering the tickets. It can contain only
            `open`, `resolved` and `deleted`. By default, no status filter is applied.

        Returns
        -------
        list[dict]
            List of tickets.

        Raises
        ------
        MessageNotFoundException
            Thrown if the message of a ticket does not exist.
        """
        res = []
        count = 0
        for ticket in self.data["tickets"]:
            if status is None or ticket.status in set(status):
                count += 1

                if count <= skip:
                    continue

                res.append(dict(ticket))

                if limit is not None and len(res) == limit:
                    break

        for ticket in res:
            try:
                ticket["message"] = dict(self.get_message(ticket["msg_id"]))
            except MessageNotFoundException:
                raise MessageNotFoundException(
                    f"No such message with id {ticket.msg_id} for ticket with id: {ticket.id}"
                )

        return res

    def get_ticket(self, ticket_id: str) -> TicketModel:
        """
        Gets the ticket with the given `ticket_id`.

        Parameters
        ----------
        ticket_id: str
            Ticket identifier.

        Returns
        -------
        TicketModel
            Ticket with the given `ticket_id`.

        Raises
        ------
        TicketNotFoundException
            Thrown if the ticket with the given `ticket_id` does not exist.
        """
        for ticket in self.data["tickets"]:
            if ticket.id == ticket_id:
                return ticket

        raise TicketNotFoundException(f"No such ticket with id: {ticket_id}")

    def resolve_ticket(self, ticket_id: str) -> TicketModel:
        """
        Resolves the ticket with the given `ticket_id`.

        Parameters
        ----------
        ticket_id: str
            Ticket identifier.

        Returns
        -------
        TicketModel
            Ticket resolved.

        Raises
        ------
        TicketNotFoundException
            Thrown if the ticket with the given `ticket_id` does not exist.
        SaveFailedException:
            Thrown if the data is not saved successfully.
        """
        ticket = self.get_ticket(ticket_id)

        ticket.status = Status.RESOLVED
        ticket.ts_last_status_change = datetime.now(timezone.utc)

        self.save_data()
        return ticket

    def delete_ticket(self, ticket_id: str) -> TicketModel:
        """
        Deletes the ticket with the given `ticket_id`.

        Parameters
        ----------
        ticket_id: str
            Ticket identifier.

        Returns
        -------
        TicketModel
            Ticket deleted.

        Raises
        ------
        TicketNotFoundException
            Thrown if the ticket with the given `ticket_id` does not exist.
        SaveFailedException:
            Thrown if the data is not saved successfully.
        """
        ticket = self.get_ticket(ticket_id)

        ticket.status = Status.DELETED
        ticket.ts_last_status_change = datetime.now(timezone.utc)

        self.save_data()
        return ticket

    def get_message(self, message_id: str) -> MessageModel:
        """
        Gets the message with the given `message_id`.

        Parameters
        ----------
        message_id: str
            Message identifier.

        Returns
        -------
        MessageModel
            Message with the given `message_id`.

        Raises
        ------
        MessageNotFoundException
            Thrown if the message with the given `message_id` does not exist.
        """
        for message in self.data["messages"]:
            if message.id == message_id:
                return message

        raise MessageNotFoundException(f"No such message with id: {message_id}")

    def get_ticket_context_messages(self, ticket_id: str) -> MessageModel:
        """
        Gets the ticket context messages with the given `ticket_id`.

        Parameters
        ----------
        ticket_id: str
            Ticket identifier.

        Returns
        -------
        list[MessageModel]
            Context messages belonging to the ticket with the given `ticket_id`.

        Raises
        ------
        TicketNotFoundException
            Thrown if the ticket with the given `ticket` does not exist.
        """
        ticket = self.get_ticket(ticket_id)

        res = []
        for message in self.data["messages"]:
            if message.id in ticket.context_messages:
                res.append(message)

        return res
