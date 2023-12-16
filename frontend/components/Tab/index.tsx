import styles from "./tab.module.css";

const Tab: Function = ({ id, name, num, selected, onClick }) => {
  return (
    <button
      id={id}
      className={`${styles.tab} ${selected ? styles.tabSelected : ""}`}
      onClick={onClick}
    >
      {name}&nbsp;
      <div className={styles.tabNumber}>{num}</div>
    </button>
  );
};

export default Tab;
