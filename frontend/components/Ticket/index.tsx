import { useState, useEffect, useRef } from "react";
import styles from "./ticket.module.css";
import Loading from "../Loading";
import Badge from "../Badge";
import Image from "next/image";
import StatusChip from "../StatusChip";

const backendUrl = "http://127.0.0.1:5001";

const Ticket: Function = ({
  ticket,
  resolveTicketHandler,
  deleteTicketHandler,
}) => {
  const [loaded, setLoaded] = useState(false);

  const [status, setStatus] = useState(ticket.status);
  const [ts_last_status_change, setTsLastStatusChange] = useState(
    ticket.ts_last_status_change,
  );
  const [message, setMessage] = useState(undefined);

  const [showContextMessages, setShowContextMessages] = useState(false);
  const [contextMessages, setContextMessages] = useState([]);

  const domContextMessagesButton = useRef(undefined);

  const dateLocale = "en-DE";
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  useEffect(() => {
    const fetchData = async (ticket_id) => {
      const url = backendUrl + `/ticket/${ticket_id}/message`;
      fetch(url, {
        method: "GET",
        mode: "cors",
        headers: { accept: "application/json" },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ticket with id ${ticket_id}`);
          }
          return response.json();
        })
        .then((data) => {
          setMessage(data);
        })
        .catch((error) => {
          console.error(`Error while getting ticket: ${error}`);
        });
    };

    setLoaded(false);
    fetchData(ticket.id).then(() => {
      setLoaded(true);
    });
  }, [ticket.id]);

  useEffect(() => {
    setLoaded(false);

    if (showContextMessages) {
      ticket.context_messages.forEach(async (message_id) => {
        const url = backendUrl + `/message/${message_id}`;
        fetch(url, {
          method: "GET",
          mode: "cors",
          headers: { accept: "application/json" },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch message with id ${message_id}`);
            }
            return response.json();
          })
          .then((data) => {
            setContextMessages((prevCtxMsg) => [...prevCtxMsg, data]);
          })
          .catch((error) => {
            console.error(`Error while getting message: ${error}`);
          });
      });

      if (domContextMessagesButton.current != undefined) {
        domContextMessagesButton.current.className = `${styles.contextMessagesButton} ${styles.contextMessagesButtonClicked}`;
      }
    } else {
      setContextMessages([]);

      if (domContextMessagesButton.current != undefined) {
        domContextMessagesButton.current.className =
          styles.contextMessagesButton;
      }
    }

    setLoaded(true);
  }, [ticket.context_messages, showContextMessages]);

  const resolveTicket = async () => {
    if (ticket.status !== "resolved") {
      const url = backendUrl + `/ticket/${ticket.id}`;
      return fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: { accept: "application/json" },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to resolve ticket with id ${ticket.id}`);
          }
          return true;
        })
        .catch((error) => {
          console.error(`Error while resolving ticket: ${error}`);
          return false;
        });
    } else {
      return false;
    }
  };

  const deleteTicket = async () => {
    if (ticket.status !== "deleted") {
      const url = backendUrl + `/ticket/${ticket.id}`;
      return fetch(url, {
        method: "DELETE",
        mode: "cors",
        headers: { accept: "application/json" },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to delete ticket with id ${ticket.id}`);
          }
          return true;
        })
        .catch((error) => {
          console.error(`Error while deleting ticket: ${error}`);
          return false;
        });
    } else {
      return false;
    }
  };

  return (
    <div className={styles.ticketContainer}>
      {!loaded && <Loading />}
      {loaded && message && (
        <div className={styles.ticketDetails}>
          {/* Ticket details */}
          <div className={styles.messageContent}>
            {message.content}
            {message.has_attachment && (
              <Badge
                text={
                  <>
                    &nbsp;
                    <Image
                      src="/attachment.svg"
                      alt="attachment"
                      width={16}
                      height={16}
                    />
                    &nbsp;
                  </>
                }
              />
            )}
          </div>
          <div className={styles.messageDetails}>
            <div className={styles.messageDetailsItem}>
              <div className={styles.messageDetailsItemTitle}>
                Author
                {message.author.is_bot ? (
                  <Badge text="BOT" blink={true} />
                ) : (
                  <Badge text="NOT BOT" />
                )}
              </div>
              <div className={styles.messageDetailsItemValue}>
                {message.author?.nickname}
              </div>
            </div>
            <div className={styles.messageDetailsItem}>
              <div className={styles.messageDetailsItemTitle}>
                Creation Time
              </div>
              <div className={styles.messageDetailsItemValue}>
                {new Date(message.timestamp_insert)
                  .toLocaleDateString(dateLocale, dateOptions)
                  .replaceAll("/", ".")}
              </div>
            </div>
            <div className={styles.messageDetailsItem}>
              <div className={styles.messageDetailsItemTitle}>
                Status Change Time
              </div>
              <div className={styles.messageDetailsItemValue}>
                {ts_last_status_change
                  ? new Date(ts_last_status_change)
                      .toLocaleDateString(dateLocale, dateOptions)
                      .replaceAll("/", ".")
                  : new Date(ticket.timestamp)
                      .toLocaleDateString(dateLocale, dateOptions)
                      .replaceAll("/", ".")}
              </div>
            </div>
            <div
              className={styles.messageDetailsItem}
              style={{ width: "7rem" }}
            >
              <div className={styles.messageDetailsItemTitle}>Status</div>
              <div className={styles.messageDetailsItemValue}>
                <StatusChip status={status} />
              </div>
            </div>
            <a
              className={`${styles.button} ${styles.openMessageButton}`}
              href={message.msg_url}
              target="_blank"
              rel="noreferrer"
            >
              Open Message
            </a>
            <button
              className={`${styles.button} ${styles.resolveTicketButton}`}
              disabled={status === "resolved"}
              onClick={() => {
                resolveTicket().then(async (resolved) => {
                  if (resolved) {
                    setStatus("resolved");
                    setTsLastStatusChange(new Date().toUTCString());
                    await resolveTicketHandler();
                  }
                });
              }}
            >
              Resolve Ticket
            </button>
            <button
              className={`${styles.button} ${styles.deleteTicketButton}`}
              disabled={status === "deleted"}
              onClick={() => {
                deleteTicket().then(async (deleted) => {
                  if (deleted) {
                    setStatus("deleted");
                    setTsLastStatusChange(new Date().toUTCString());
                    await deleteTicketHandler();
                  }
                });
              }}
            >
              Delete Ticket
            </button>
          </div>
          {/* Ticket Context Messages */}
          <div className={styles.contextMessagesContainer}>
            <div className={styles.contextMessagesButtonContainer}>
              <button
                className={styles.contextMessagesButton}
                onClick={() => {
                  setShowContextMessages(!showContextMessages);
                }}
                ref={domContextMessagesButton}
              >
                Context Messages
              </button>
            </div>
            {loaded && showContextMessages && contextMessages.length > 0 && (
              <ol className={styles.contextMessagesTable}>
                {contextMessages.map((message, idx) => {
                  return (
                    <li key={idx}>
                      <a
                        href={message.msg_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {message.content}
                        {message.has_attachment && (
                          <Badge
                            text={
                              <>
                                &nbsp;
                                <Image
                                  src="/attachment.svg"
                                  alt="attachment"
                                  width={16}
                                  height={16}
                                />
                                &nbsp;
                              </>
                            }
                          />
                        )}
                        , by {message.author.nickname}
                        {message.author.is_bot ? (
                          <Badge text="BOT" blink={true} />
                        ) : (
                          <Badge text="NOT BOT" />
                        )}
                        <Image
                          src="/external_link.svg"
                          alt="external link"
                          width={16}
                          height={16}
                          style={{
                            flexShrink: "0",
                          }}
                        />
                      </a>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticket;
