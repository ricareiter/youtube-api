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

    await page.setViewport({ width: 1920, height: 1080 });

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() === "image") {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(`https://www.youtube.com/@${channelName}/videos`, {
      waitUntil: "networkidle2",
    });

    await page.evaluate(
      () =>
        new Promise((resolve) => {
          var scrollTop = -1;
          const interval = setInterval(() => {
            window.scrollBy(0, 100);
            if (document.documentElement.scrollTop !== scrollTop) {
              scrollTop = document.documentElement.scrollTop;
              return;
            }
            clearInterval(interval);
            resolve();
          }, 100);
        })
    );

    await new Promise((r) => setTimeout(r, 1000));

    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll("ytd-rich-grid-media");

      const videoData = [];

      videoElements.forEach((content) => {
        const titleSelector = content.querySelector("#video-title-link");
        const title = titleSelector.title.trim();

        const hrefSelector = content.querySelector("#video-title-link");
        const href = hrefSelector.href;

        const url = new URL(href);
        const videoId = url.searchParams.get("v");

        const viewsSelector = content.querySelector(
          "#metadata-line > span:nth-child(3)"
        );
        const views = viewsSelector.textContent.split(" ")[0];

        const videoPostedSelector = content.querySelector(
          "#metadata-line > span:nth-child(4)"
        );
        const videoPosted = videoPostedSelector.textContent;

        const videoDurationSelector =
          content.querySelector("badge-shape > div");
        const videoDuration = videoDurationSelector.textContent;

        videoData.push({
          videoId,
          title,
          href,
          views,
          videoDuration,
          videoPosted,
        });
      });

      return videoData;
    });

    await browser.close();

    return new Response(JSON.stringify(videos), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
