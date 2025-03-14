import { chromium } from 'playwright';

export async function GET({ url }) {
    const startingPage = url.searchParams.get('startingPage');
    if (!startingPage) {
        return {
            status: 400,
            body: { error: 'No starting page URL provided' },
        };
    }

    // Initialize Playwright
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(startingPage);

    // Gather distinct outbound links
    const outboundLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links
            .map(link => link.href)
            .filter(href => href.startsWith('http') && !href.includes(window.location.hostname));
    });

    const results = [];

    // Analyze each outbound link
    for (const link of outboundLinks) {
        const analysis = await analyzePage(link, browser);
        results.push({ link, ...analysis });
    }

    await browser.close();

    return {
        status: 200,
        body: { results },
    };
}

// Function to analyze a page's content
async function analyzePage(url, browser) {
    const page = await browser.newPage();
    await page.goto(url);

    // Count visible words
    const visibleText = await page.evaluate(() => {
        return document.body.innerText.trim().split(/\s+/).length;
    });

    // Count images
    const imageCount = await page.evaluate(() => {
        return document.querySelectorAll('img').length;
    });

    // Count tables
    const tableCount = await page.evaluate(() => {
        return document.querySelectorAll('table').length;
    });

    return {
        visibleWords: visibleText,
        images: imageCount,
        tables: tableCount,
    };
}
