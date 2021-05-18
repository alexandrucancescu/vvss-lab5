"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const is_ci_1 = __importDefault(require("is-ci"));
const File_1 = require("./util/File");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
let page;
let browser;
const webMailUrl = "https://www.scs.ubbcluj.ro/webmail/?_task=mail";
const testData = File_1.getTestData();
mocha_1.before(async () => {
    browser = await puppeteer_1.default.launch({
        headless: is_ci_1.default,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        devtools: true,
    });
    page = (await browser.pages())[0];
});
mocha_1.after(async () => {
    await browser.close();
});
async function resetPage() {
    const prevPage = page !== null && page !== void 0 ? page : (await browser.pages())[0];
    page = await browser.newPage();
    await prevPage.close();
}
function debug(...log) {
    if (is_ci_1.default)
        console.log(...log);
}
async function fillLogin(data) {
    await page.goto(webMailUrl);
    const usernameInput = await page.waitForXPath("//td[@class='input']/input[@name='_user']", {
        timeout: 3500
    });
    const passwordInput = await page.waitForXPath("//td[@class='input']/input[@name='_pass']", {
        timeout: 1000
    });
    await usernameInput.type(data.username);
    await passwordInput.type(data.password);
    await (await page.$x("//p[@class='formbuttons']/input[@id='rcmloginsubmit']")).pop().click();
}
mocha_1.describe("Login", () => {
    mocha_1.it("Should fail for invalid login data", async () => {
        await resetPage();
        await fillLogin(testData.wrong);
        const messageEl = await page.waitForXPath("//div[@id='message']//div[@class='warning']", {
            timeout: 9000
        });
        const message = await messageEl.evaluate((el) => el.textContent);
        chai_1.expect(message).to.equal("Login failed.");
    });
    mocha_1.it("Should succeed in login with correct data", async () => {
        await resetPage();
        await fillLogin(testData.correct);
        await page.waitForXPath("//ul[@id='mailboxlist']//a[@rel='INBOX']");
    });
    mocha_1.it("Should be able to send a mail", async () => {
        const composeButton = await page.waitForXPath("//div[@id='messagetoolbar']//a[@class='button compose']", {
            timeout: 500
        });
        let toInput;
        let tries = 4;
        do {
            try {
                debug("waiting for 'to' input");
                toInput = await page.waitForXPath("//textarea[@name='_to']", {
                    timeout: 3500
                });
            }
            catch (err) {
                debug("clicking compose again!");
                await composeButton.click();
            }
        } while (toInput === undefined && tries-- > 0);
        if (!toInput)
            throw new Error("Could not compose mail");
        await toInput.type(`${testData.correct.username}@scs.ubbcluj.ro`);
        debug("typed recipient");
        const subject = `mail_test_${Math.ceil(Math.random() * 1000)}_${Date.now()}`;
        const subjectInput = await page.waitForXPath("//input[@name='_subject']", {
            timeout: 1000
        });
        await subjectInput.type(subject);
        debug("typed subject");
        const messageInput = await page.waitForXPath("//textarea[@name='_message']", {
            timeout: 1000
        });
        await messageInput.type(subject);
        debug("typed message");
        debug("clicking send");
        await (await page.waitForXPath("//div[@id='compose-buttons']//input[@type='button']", {
            timeout: 1000
        })).click();
        const inboxButton = await page.waitForXPath("//ul[@id='mailboxlist']//a[@rel='INBOX']", {
            timeout: 5000
        });
        debug("click on inbox");
        await inboxButton.click();
        tries = 5;
        while (tries-- > 0) {
            try {
                debug("waiting for mail to be in inbox");
                await page.waitForXPath(`//span[text() = '${subject}']`, {
                    timeout: 2000
                });
                return;
            }
            catch (err) {
                debug(`mail not present. Tries left ${tries}`);
                await inboxButton.click();
            }
        }
        throw new Error("Mail not received");
    });
});
//# sourceMappingURL=webmail.test.js.map