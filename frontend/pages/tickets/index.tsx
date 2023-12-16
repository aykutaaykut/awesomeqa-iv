import * as React from "react";
import { NextPage } from "next";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Loading from "../../components/Loading";
import NoResults from "../../components/NoResults";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Ticket from "../../components/Ticket";
import Tab from "../../components/Tab";
import styles from "./tickets.module.css";

const backendUrl = "http://127.0.0.1:5001";

const Tickets: NextPage = () => {
  const [loaded, setLoaded] = useState(false);

  const [tickets, setTickets] = useState([]);

  const [openTickets, setOpenTickets] = useState(0);
  const [resolvedTickets, setResolvedTickets] = useState(0);
  const [deletedTickets, setDeletedTickets] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  const pageSize = 20;

  const [tab, setTab] = useState("open");
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const urlTab = searchParams.get("tab");
    const urlPage = Number(searchParams.get("page"));

    if (urlTab === "open" || urlTab === "resolved" || urlTab === "deleted") {
      fetchData(0, 1, urlTab).then((data) => {
        const total = data.totalTickets[urlTab];

        if (urlPage >= 1 && urlPage <= Math.ceil(total / pageSize)) {
          setTab(urlTab);
          setCurrentPage(urlPage);

          handleChangeInURL(urlTab, urlPage);
        } else {
          handleTabChange(urlTab);
        }
      });
    } else {
      handleTabChange("open");
    }
  }, []);

  const fetchData = async (startIndex, size, tab) => {
    const queryParams = new URLSearchParams({
      skip: startIndex.toString(),
      limit: size.toString(),
      status: tab,
    });
    const url = `${backendUrl}/tickets?${queryParams}`;

    return fetch(url, {
      method: "GET",
      mode: "cors",
      headers: { accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        return response.json();
      })
      .catch((error) => {
        console.error(`Error while getting tickets: ${error}`);
      });
  };

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    fetchData(startIndex, pageSize, tab).then((data) => {
      setLoaded(false);

      setOpenTickets(data.totalTickets.open);
      setResolvedTickets(data.totalTickets.resolved);
      setDeletedTickets(data.totalTickets.deleted);

      setTotalTickets(data.totalTickets[tab]);

      setTickets(data.tickets);

      setLoaded(true);
    });
  }, [currentPage, tab]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setCurrentPage(1);
    handleChangeInURL(newTab, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleChangeInURL(tab, newPage);
  };

  const handleChangeInURL = (newTab: string, newPage: number) => {
    router.push(`/tickets?tab=${newTab}&page=${newPage}`);
  };

  const updateTickets = async (ticket_id) => {
    let updatedTickets = [...tickets];
    const index = updatedTickets.findIndex((t) => t.id === ticket_id);

    if (index !== -1) {
      if (updatedTickets.length === 1) {
        if (currentPage > 1) {
          handlePageChange(currentPage - 1);
        } else {
          setTickets([]);
        }
      } else {
        const startIndex =
          (currentPage - 1) * pageSize + updatedTickets.length - 1;

        if (startIndex < totalTickets - 1) {
          fetchData(startIndex, 1, tab).then((data) => {
            updatedTickets.splice(index, 1);
            updatedTickets.push(data.tickets[0]);

            setTickets(updatedTickets);
          });
        } else {
          updatedTickets.splice(index, 1);

          setTickets(updatedTickets);
        }
      }
    }
  };

  const resolveTicketHandler = async (ticket_id) => {
    await updateTickets(ticket_id);

    if (tab === "open") {
      setOpenTickets((prev) => prev - 1);
    } else if (tab === "deleted") {
      setDeletedTickets((prev) => prev - 1);
    }

    setResolvedTickets((prev) => prev + 1);
    setTotalTickets((prev) => prev - 1);
  };

  const deleteTicketHandler = async (ticket_id) => {
    await updateTickets(ticket_id);

    if (tab === "open") {
      setOpenTickets((prev) => prev - 1);
    } else if (tab === "resolved") {
      setResolvedTickets((prev) => prev - 1);
    }

    setDeletedTickets((prev) => prev + 1);
    setTotalTickets((prev) => prev - 1);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1, mt: "1rem", mb: "1rem" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <div className={styles.ticketsTitleContainer}>
                <div className={styles.ticketsTitle}>
                  {"Tickets"}&nbsp;&nbsp;
                </div>
                <Tab
                  id="tab-open"
                  name="Open"
                  selected={tab === "open"}
                  num={openTickets}
                  onClick={() => {
                    handleTabChange("open");
                  }}
                />
                <Tab
                  id="tab-resolved"
                  name="Resolved"
                  selected={tab === "resolved"}
                  num={resolvedTickets}
                  onClick={() => {
                    handleTabChange("resolved");
                  }}
                />
                <Tab
                  id="tab-deleted"
                  name="Deleted"
                  selected={tab === "deleted"}
                  num={deletedTickets}
                  onClick={() => {
                    handleTabChange("deleted");
                  }}
                />
              </div>
              {!loaded && <Loading />}
              <div className={styles.content}>
                {loaded && totalTickets === 0 && <NoResults />}
                {loaded && totalTickets > 0 && (
                  <>
                    <table className={styles.ticketsTable}>
                      <tbody>
                        {tickets.map((ticket) => {
                          return (
                            <tr key={ticket.id}>
                              <td>
                                <Ticket
                                  ticket={ticket}
                                  resolveTicketHandler={async () => {
                                    await resolveTicketHandler(ticket.id);
                                  }}
                                  deleteTicketHandler={async () => {
                                    await deleteTicketHandler(ticket.id);
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className={styles.paginationButtonContainer}>
                      {/* Pagination controls */}
                      <button
                        className={styles.paginationButton}
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </button>
                      {Array(Math.ceil(totalTickets / pageSize))
                        .fill(0)
                        .map((_, i) => {
                          const page = i + 1;
                          return (
                            <a
                              key={i}
                              className={
                                page === currentPage
                                  ? styles.pageButtonCurrentPage
                                  : styles.pageButton
                              }
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </a>
                          );
                        })}
                      <button
                        className={styles.paginationButton}
                        disabled={currentPage * pageSize >= totalTickets}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Tickets;
