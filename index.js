const vote = require("./Scraper");
const fs = require("fs");

(async () => {
    console.clear();

    const tokens = fs.readFileSync("./tokens.txt", "utf8").trim().split(/\n/g);

    for (let i = 0; i < tokens.length; i++) {
        const x = await vote(tokens[i]);
        if (x) continue;
        else break;
    }
    process.exit(0);
})();
