const { CronJob } = require("cron");
const vote = require("./Scraper");
const fs = require("fs");
const tokens = fs.readFileSync("./tokens.txt", "utf8").trim().split(/\n/g);

const job = new CronJob(
    "1 */12 * * *",
    async () => {
        console.clear();
        for (let i = 0; i < tokens.length; i++) {
            const x = await vote(tokens[i]);
            if (x) continue;
            else break;
        }
    },
    null,
    true,
    "America/Sao_Paulo" //Change to your timezone
);

job.start();
