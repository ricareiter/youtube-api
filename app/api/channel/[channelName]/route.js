const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium-min");

export const GET = async (request, { params }) => {
  const { channelName } = await params;
  try {
    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

    const browser = await puppeteer.launch({
      args: isLocal
        ? [...puppeteer.defaultArgs(), "--lang=en-US"]
        : [
            ...chromium.args,
            "--lang=en-US",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-images",
            "--disable-fonts",
          ],
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
        )),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() === "image") {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(`https://www.youtube.com/@${channelName}`, {
      waitUntil: "networkidle2",
    });

    const btn = await page.waitForSelector(
      "yt-description-preview-view-model > truncated-text > button",
      { timeout: 5000 }
    );

    await btn.click();

    await page.waitForSelector("#description-container > span");

    const channel = await page.evaluate(() => {
      const channelData = [];

      const channelNameSelector = document.querySelector(
        "#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > div > yt-dynamic-text-view-model > h1 > span"
      );

      const profileImageUrlSelector = document.querySelector(
        "#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > yt-decorated-avatar-view-model > yt-avatar-shape > div > div > div > img"
      );

      const descriptionSelector = document.querySelector(
        "#description-container > span"
      );

      const totalSubscribersSelector = document.querySelector(
        "#additional-info-container > table > tbody > tr:nth-child(4) > td:nth-child(2)"
      );

      const totalVideosSelector = document.querySelector(
        "#additional-info-container > table > tbody > tr:nth-child(5) > td:nth-child(2)"
      );

      const totalViewsSelector = document.querySelector(
        "#additional-info-container > table > tbody > tr:nth-child(6) > td:nth-child(2)"
      );

      const joinedAtSelector = document.querySelector(
        "#additional-info-container > table > tbody > tr:nth-child(7) > td:nth-child(2) > yt-attributed-string > span > span"
      );

      const channelName = channelNameSelector.textContent;
      const profileImageUrl = profileImageUrlSelector.src;
      const description = descriptionSelector.textContent;
      const totalSubscribers =
        totalSubscribersSelector.textContent.split(" ")[0];
      const totalVideos = totalVideosSelector.textContent.split(" ")[0];
      const totalViews = totalViewsSelector.textContent.split(" ")[0];
      const joinedAt = joinedAtSelector.textContent.replace("Joined ", "");

      channelData.push({
        channelName,
        profileImageUrl,
        description,
        totalSubscribers,
        totalVideos,
        totalViews,
        joinedAt,
      });
      return channelData;
    });

    await browser.close();

    return new Response(JSON.stringify(channel), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
