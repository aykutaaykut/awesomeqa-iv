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
import services from "../../service";

const Tickets: NextPage = () => {
  const [loaded, setLoaded] = useState(false);

  const [tickets, setTickets] = useState([]);

  const [numOfTickets, setNumOfTickets] = useState({
    open: 0,
    resolved: 0,
    deleted: 0,
  });

  const pageSize = 20;

  const [tab, setTab] = useState("open");
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const urlTab = searchParams.get("tab");
    const urlPage = Number(searchParams.get("page"));

    services.apiService
      .getStatistics()
      .then((stats) => {
        setNumOfTickets(stats);
        return stats;
      })
      .then((stats) => {
        if (
          urlTab === "open" ||
          urlTab === "resolved" ||
          urlTab === "deleted"
        ) {
          const total = stats[urlTab];
          if (urlPage >= 1 && urlPage <= Math.ceil(total / pageSize)) {
            setTab(urlTab);
            setCurrentPage(urlPage);

            handleChangeInURL(urlTab, urlPage);
          } else {
            handleTabChange(urlTab);
          }
        } else {
          handleTabChange("open");
        }
      });
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    services.apiService.getTickets(startIndex, pageSize, tab).then((data) => {
      setLoaded(false);

      setTickets(data);

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

        if (startIndex < numOfTickets[tab] - 1) {
          services.apiService.getTickets(startIndex, 1, tab).then((data) => {
            updatedTickets.splice(index, 1);
            updatedTickets.push(data[0]);

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

    setNumOfTickets((prev) => ({
      ...prev,
      [tab]: prev[tab] - 1,
      resolved: prev["resolved"] + 1,
    }));
  };

  const deleteTicketHandler = async (ticket_id) => {
    await updateTickets(ticket_id);

    setNumOfTickets((prev) => ({
      ...prev,
      [tab]: prev[tab] - 1,
      deleted: prev["deleted"] + 1,
    }));
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
                  num={numOfTickets["open"]}
                  onClick={() => {
                    handleTabChange("open");
                  }}
                />
                <Tab
                  id="tab-resolved"
                  name="Resolved"
                  selected={tab === "resolved"}
                  num={numOfTickets["resolved"]}
                  onClick={() => {
                    handleTabChange("resolved");
                  }}
                />
                <Tab
                  id="tab-deleted"
                  name="Deleted"
                  selected={tab === "deleted"}
                  num={numOfTickets["deleted"]}
                  onClick={() => {
                    handleTabChange("deleted");
                  }}
                />
              </div>
              {!loaded && <Loading />}
              <div className={styles.content}>
                {loaded && numOfTickets[tab] === 0 && <NoResults />}
                {loaded && numOfTickets[tab] > 0 && (
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
                      {Array(Math.ceil(numOfTickets[tab] / pageSize))
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
                        disabled={currentPage * pageSize >= numOfTickets[tab]}
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
