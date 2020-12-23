const { CronJob } = require("cron");
const config = require("./config");
const vote = require("./Scraper");

const delays = [3600000,3636000,3672000,3708000,3744000,3780000,3816000,3852000,3888000,3924000,3960000,3996000,4032000,4068000,4104000,4140000,4176000,4212000,4248000,4284000,4320000,4356000,4392000,4428000,4464000,4500000,4536000,4572000,4608000,4644000,4680000,4716000,4752000,4788000,4824000,4860000,4896000,4932000,4968000,5004000,5040000,5076000,5112000,5148000,5184000,5220000,5256000,5292000,5328000,5364000]

const job = new CronJob(
    "1 */12 * * *",
    async () => {
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * delays.length)));
        for (let i = 0; i < config.tokens.length; i++) {
            const x = await vote(config.tokens[i]);
            if (x) continue;
            else break;
        }
    },
    null,
    true,
    "America/Sao_Paulo" //Change to your timezone
);

job.start();
