/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url:'postgresql://MockQBitDatabase_owner:0lY9qgCPpQMU@ep-soft-poetry-a1hledt8.ap-southeast-1.aws.neon.tech/MockQBitDatabase?sslmode=require'
  }
};
