import cron, { CronJob } from "cron";
import User from "../models/user.js";

const job = new cron.CronJob("0 0 1 * *", async () => {
  try {
    const result = await User.updateMany(
      { hasPaid: true },
      { $set: { monthlyRequests: 90 } }
    );

    console.log(` Monthly reset: ${result.modifiedCount} users updated`);
  } catch (err) {
    console.error("Error during monthly reset:", err);
  }
});

export default job;
