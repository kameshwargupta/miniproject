import * as schema from "./schema";

export * from "./schema";

export const TIDB_CONFIG = {
  host: process.env.TIDB_HOST || "gateway01.ap-northeast-1.prod.aws.tidbcloud.com",
  port: Number(process.env.TIDB_PORT || 4000),
  user: process.env.TIDB_USER || "2yubzc3at6JgYiJ.root",
  password: process.env.TIDB_PASSWORD || "r9MOcOtabXnQHFie",
  database: process.env.TIDB_DATABASE || "carewatch",
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
};
