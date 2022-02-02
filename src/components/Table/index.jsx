/**
 * Code taken from https://dev.to/franciscomendes10866/how-to-create-a-table-with-pagination-in-react-4lpd
 */

// import React, { useState } from "react";

// import useTable from "../../hooks/useTable";
import styles from "./Table.module.css";
// import TableFooter from "./TableFooter";

const Table = () => {
// const Table = ({ data, rowsPerPage }) => {
  // const [page, setPage] = useState(1);
  // const { slice, range } = useTable(data, page, rowsPerPage);
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableRowHeader} colSpan={4}><strong>Active Connections</strong></th>
          </tr>
          <tr>
            <th className={styles.tableHeader}>Student ID</th>
            <th className={styles.tableHeader}>Username</th>
            <th className={styles.tableHeader}>Current Test</th>
            <th className={styles.tableHeader}>Date Joined</th>
          </tr>
        </thead>
        <tbody id='active-users'>
          {/* {slice.map((el) => (
            <tr className={styles.tableRowItems} key={el.id}>
              <td className={styles.tableCell}>{el.name}</td>
              <td className={styles.tableCell}>{el.capital}</td>
              <td className={styles.tableCell}>{el.language}</td>
            </tr>
          ))} */}
        </tbody>
      </table>
      {/* <TableFooter range={range} slice={slice} setPage={setPage} page={page} /> */}
    </>
  );
};

export default Table;
