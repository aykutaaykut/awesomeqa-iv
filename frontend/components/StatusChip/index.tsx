import Image from "next/image";
import styles from "./statusChip.module.css";

const StatusChip: Function = ({ status }) => {
  return (
    <div className={styles.statusChip}>
      <Image
        src={`/statusChips/${status}.svg`}
        alt={`${status} chip`}
        width={16}
        height={16}
        style={{
          flexShrink: "0",
        }}
      />
      <p>{status.charAt(0).toUpperCase() + status.slice(1)}</p>
    </div>
  );
};

export default StatusChip;
