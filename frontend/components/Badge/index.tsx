import styles from "./badge.module.css";

const Badge: Function = ({ text, blink = false }) => {
  const cls = blink ? `${styles.badge} ${styles.blink}` : `${styles.badge}`;
  return (
    <>
      &nbsp;
      <span className={cls}>{text}</span>
      &nbsp;
    </>
  );
};

export default Badge;
