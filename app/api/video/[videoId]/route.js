const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium-min");

export const GET = async (request, { params }) => {
  const { videoId } = await params;
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

    await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("#title > h1 > yt-formatted-string", {
      timeout: 5000,
    });

    await page.evaluate(
      () =>
        new Promise((resolve) => {
          var scrollTop = -1;
          const interval = setInterval(() => {
            window.scrollBy(0, 500);
            if (document.documentElement.scrollTop !== scrollTop) {
              scrollTop = document.documentElement.scrollTop;
              return;
            }
            clearInterval(interval);
            resolve();
          }, 200);
        })
    );

    await new Promise((r) => setTimeout(r, 1000));

    const videos = await page.evaluate(() => {
      const videoData = [];

      const commentsDiv = document.querySelector("#snippet");
      commentsDiv.click();

      const videoTitleSelector = document.querySelector(
        "#title > h1 > yt-formatted-string"
      );
      const videoViewsSelector = document.querySelector(
        "#info > span:nth-child(1)"
      );
      const postedAtSelector = document.querySelector(
        "#info > span:nth-child(3)"
      );
      const likesSelector = document.querySelector(
        "#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > like-button-view-model > toggle-button-view-model > button-view-model > button > div.yt-spec-button-shape-next__button-text-content"
      );
      const commentsSelector = document.querySelector(
        "#count > yt-formatted-string > span:nth-child(1)"
      );

      const videoTitle = videoTitleSelector.textContent;
      const videoViews = videoViewsSelector.textContent.split(" ")[0];
      const postedAt = postedAtSelector.textContent;
      const likes = likesSelector.textContent;
      const comments = commentsSelector?.textContent || "N/A";

      videoData.push({
        videoTitle,
        videoViews,
        postedAt,
        likes,
        comments,
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
