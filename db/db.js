import { createPool } from "mysql2";
import config from "./config.js";

const connectDB = async () => {
  const pool = createPool(config);

  pool.getConnection((err, connection) => {
    if (err) {
      console.log({ error: err.message });
      return;
    }

    console.log("Connected to MySQL database");
    connection.release();
  });
  return pool;
};

export default connectDB;
