const logger = require("ora");
const config = require("./config");
const puppeteer = require("puppeteer-extra");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const proxyChain = require("proxy-chain");

const URL = "https://discord.com/login?redirect_to=%2Foauth2%2Fauthorize%3Fclient_id%3D264434993625956352%26scope%3Didentify%26redirect_uri%3Dhttps%253A%252F%252Ftop.gg%252Flogin%252Fcallback%26response_type%3Dcode";

const spinner = {
    interval: 60,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
};

function vote(token) {
    return new Promise(async function (resolve, reject) {
        await puppeteer
            .launch({
                // For Linux or WSL

                //executablePath: "/usr/bin/chromium-browser",
                //args: ["--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox", "--no-first-run", "--no-sandbox", "--no-zygote", "--single-process"],

                // For Windows

                args: [`--proxy-server=${await proxyChain.anonymizeProxy(config.proxy)}`],
                headless: true, // Opens chrome or not(true means that is off), recommended to be false
                slowMo: 10
            })
            .then(async (browser) => {
                console.log(`[RUNNING AS]: ${token}`);

                const page = await browser.newPage();

                const connectLog = logger({
                    text: "[CONNECTING TO DISCORD]",
                    spinner
                }).start();

                await page.goto(URL, { waitUntil: "networkidle0" });

                connectLog.succeed("[CONNECTED TO DISCORD]");

                const discordLog = logger({
                    text: "[LOGGING INTO DISCORD]",
                    spinner
                }).start();

                const loginURL = await page.url();

                await page.evaluate((_) => {
                    Object.values(
                        webpackJsonp.push([
                            [],
                            {
                                [""]: (_, e, r) => {
                                    e.cache = r.c;
                                }
                            },
                            [[""]]
                        ]).cache
                    )
                        .find((m) => m.exports && m.exports.default && m.exports.default.login !== void 0)
                        .exports.default.loginToken(_);
                }, token);

                const logged = await page.waitForNavigation({ waitUntil: "networkidle0" }).catch((e) => null);

                if (page.url() === loginURL || !logged) {
                    await browser.close();
                    return resolve(discordLog.fail("[COULDN'T CONNECT TO DISCORD]"));
                }

                discordLog.succeed("[LOGGED INTO DISCORD]");

                const oauth2Log = logger({
                    text: "[LOGGING INTO OAUTH2]",
                    spinner
                }).start();

                await page.waitForSelector(".button-38aScr.lookFilled-1Gx00P.colorBrand-3pXr91.sizeMedium-1AC_Sl.grow-q77ONN").catch((e) => null);

                await page.evaluate((_) => {
                    document.querySelector(".button-38aScr.lookFilled-1Gx00P.colorBrand-3pXr91.sizeMedium-1AC_Sl.grow-q77ONN").click();
                });

                const oauthed = await page.waitForNavigation({ waitUntil: "networkidle0" }).catch((e) => null);

                if (!oauthed) {
                    await browser.close();
                    return resolve(oauth2Log.fail("[BLOCKED TOKEN]"));
                }

                await page.waitForSelector("#home-page");

                oauth2Log.succeed("[LOGGED INTO OAUTH2]");

                await page.goto(`https://top.gg/bot/${config.botID}/vote`, { waitUntil: "networkidle0" });

                const voteLog = logger({
                    text: "[VOTING]",
                    spinner
                }).start();
            
                const btn = await page.evaluate(() => {
                    if (document.querySelector("#votingvoted")) {
                        grecaptcha.execute()
                        return true;
                    } else return false;
                });

                if (!btn) {
                    await browser.close();
                    return resolve(voteLog.fail("[BLOCKED TOKEN]"));
                }

                await page.waitForTimeout(3000);

                const text = await page.evaluate((_) => {
                    return document.querySelector("#votingvoted").innerText;
                });

                if (text != "You already voted for this bot. Try again in 12 hours.") {
                    voteLog.succeed(`[VOTED TO ${config.botID}]`);
                } else if (!text) {
                    await browser.close();
                    return resolve(voteLog.fail(`[BLOCKED TOKEN]`));
                } else {
                    voteLog.fail(`[ALREADY VOTED TO ${config.botID}]`);
                }

                await browser.close();

                console.log("--------------------------------------");

                resolve(true);
            });
    });
}

module.exports = vote;
