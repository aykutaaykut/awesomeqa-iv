import HttpService from "./HttpService";

class ApiService extends HttpService {
  constructor(BaseUrl) {
    super(BaseUrl);
    this.getStatistics = this.getStatistics.bind(this);
    this.getTickets = this.getTickets.bind(this);
    this.getTicketContextMessagesById =
      this.getTicketContextMessagesById.bind(this);
    this.resolveTicketById = this.resolveTicketById.bind(this);
    this.deleteTicketById = this.deleteTicketById.bind(this);
  }

  async getStatistics() {
    try {
      const response = await this.instance.get(`/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error while getting statistics: ${error}`);
      throw new Error(`Failed to get statistics: ${error}`);
    }
  }

  async getTickets(skip, limit, status) {
    try {
      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        status: status.toString(),
      });
      const response = await this.instance.get(`/tickets?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error(`Error while getting tickets: ${error}`);
      throw new Error(`Failed to get tickets: ${error}`);
    }
  }

  async getTicketContextMessagesById(ticketId) {
    try {
      const response = await this.instance.get(
        `/ticket/${ticketId}/context-messages`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error while getting context messages for ticket with id ${ticketId}: ${error}`
      );
      throw new Error(
        `Failed to get context messages for ticket with id ${ticketId}: ${error}`
      );
    }
  }

  async resolveTicketById(ticketId) {
    try {
      const response = await this.instance.put(`/ticket/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error while resolving the ticket with id ${ticketId}: ${error}`
      );
      throw new Error(
        `Failed to resolve the ticket with id ${ticketId}: ${error}`
      );
    }
  }

  async deleteTicketById(ticketId) {
    try {
      const response = await this.instance.delete(`/ticket/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error while deleting the ticket with id ${ticketId}: ${error}`
      );
      throw new Error(
        `Failed to delete the ticket with id ${ticketId}: ${error}`
      );
    }
  }
}

export default ApiService;
