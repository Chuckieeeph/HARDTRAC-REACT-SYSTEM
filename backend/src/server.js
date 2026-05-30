import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { testDbConnection } from "./config/db.js";
import { ensureUserRfidSchema, syncDemoUserRfidValues } from "./models/userModel.js";

const app = createApp();

await testDbConnection();
await ensureUserRfidSchema();
await syncDemoUserRfidValues();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`HARDTRAC API running on http://localhost:${env.PORT}`);
});
