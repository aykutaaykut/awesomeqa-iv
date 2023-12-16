import Image from "next/image";
import styles from "./awesomeButton.module.css";

const AwesomeButton: Function = (props: { text: string; icon: string; onClick?: any; }) => {
  const {
    text,
    icon,
    onClick = async () => {
      console.log(`${props.text} clicked`);
    },
  } = props;

  return (
    <button className={styles.awesomeButton} onClick={onClick}>
      <div className={styles.awesomeButtonIcon}>
        <Image
          src={icon}
          alt={`${text} Icon`}
          width={38}
          height={38}
          style={{
            // width: "2.375rem",
            // height: "2.375rem",
            flexShrink: "0",
          }}
        />
      </div>
      <div className={styles.awesomeButtonText}>{text}</div>
    </button>
  );
}

export default AwesomeButton;
