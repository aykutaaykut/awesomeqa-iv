import { useState, useEffect, useRef } from "react";
import styles from "./ticket.module.css";
import Loading from "../Loading";
import Badge from "../Badge";
import Image from "next/image";
import StatusChip from "../StatusChip";
import services from "../../service";

const Ticket: Function = ({
  ticket,
  resolveTicketHandler,
  deleteTicketHandler,
}) => {
  const [loaded, setLoaded] = useState(false);

  const [status, setStatus] = useState(ticket.status);
  const [ts_last_status_change, setTsLastStatusChange] = useState(
    ticket.ts_last_status_change
  );

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
    setLoaded(false);

    if (showContextMessages) {
      if (contextMessages.length === 0) {
        services.apiService
          .getTicketContextMessagesById(ticket.id)
          .then((contextMessages) => {
            setContextMessages(contextMessages);
          });
      }

      if (domContextMessagesButton.current != undefined) {
        domContextMessagesButton.current.className = `${styles.contextMessagesButton} ${styles.contextMessagesButtonClicked}`;
      }
    } else {
      if (domContextMessagesButton.current != undefined) {
        domContextMessagesButton.current.className =
          styles.contextMessagesButton;
      }
    }

    setLoaded(true);
  }, [ticket.context_messages, showContextMessages]);

  const resolveTicket = async () => {
    if (ticket.status !== "resolved") {
      return services.apiService
        .resolveTicketById(ticket.id)
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
    } else {
      return false;
    }
  };

  const deleteTicket = async () => {
    if (ticket.status !== "deleted") {
      return services.apiService
        .deleteTicketById(ticket.id)
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
    } else {
      return false;
    }
  };

  return (
    <div className={styles.ticketContainer}>
      {!loaded && <Loading />}
      {loaded && ticket.message && (
        <div className={styles.ticketDetails}>
          {/* Ticket details */}
          <div className={styles.messageContent}>
            {ticket.message.content}
            {ticket.message.has_attachment && (
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
                {ticket.message.author?.is_bot ? (
                  <Badge text="BOT" blink={true} />
                ) : (
                  <Badge text="NOT BOT" />
                )}
              </div>
              <div className={styles.messageDetailsItemValue}>
                {ticket.message.author?.nickname}
              </div>
            </div>
            <div className={styles.messageDetailsItem}>
              <div className={styles.messageDetailsItemTitle}>
                Creation Time
              </div>
              <div className={styles.messageDetailsItemValue}>
                {new Date(ticket.message.timestamp_insert)
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
              href={ticket.message.msg_url}
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
