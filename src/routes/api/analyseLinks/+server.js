import { chromium } from 'playwright';

export async function GET({ url }) {
    const startingPage = url.searchParams.get('startingPage');
    if (!startingPage) {
        return new Response(
            JSON.stringify({ error: 'No starting page URL provided' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Initialize Playwright
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(startingPage);

    //Runs the provided function inside the browser's context (on the loaded web page).
    const outboundLinks = await page.evaluate(() => {
        const links = Array
            .from(document.querySelectorAll('a'))
            .map(link => link.href)
            .filter(href => href.startsWith('http') && !href.includes(window.location.hostname));

        const uniqueLinks = new Set(links);
        return [...uniqueLinks];
    });

    const results = await Promise.all(
        outboundLinks.map((link) =>
            analyzePage(link, browser)
                .then(analysis => ({ link, ...analysis })))
    );


    await browser.close();

    console.log("Results", results)
    return new Response(
        JSON.stringify(results),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
}

// Function to analyze a page's content
async function analyzePage(url, browser) {
    const page = await browser.newPage();
    let visibleText = 0;
    let imageCount = 0;
    let tableCount = 0;
    try {
        // Navigate and wait for the page to stabilize
        console.log("loading page:", url)
        await page.goto(url, { waitUntil: 'networkidle0' });
        console.log("page loaded:", url)

        // Count visible words
        visibleText = await page.evaluate(() => {
            // Ensure document.body exists before accessing innerText
            //if (!document.body) return 0;
            const text = document.body.innerText.trim();
            return text ? text.split(/\s+/).length : 0;
        });
        console.log("visibletext", visibleText)

        // Count images
        imageCount = await page.evaluate(() => {
            return document.querySelectorAll('img').length;
        });

        // Count tables
        tableCount = await page.evaluate(() => {
            return document.querySelectorAll('table').length;
        });


        await page.close();

    } catch (error) {
        await page.close();
        throw new Error(`Failed to analyze ${url}: ${error.message}`);
    }





    return {
        visibleWords: visibleText,
        images: imageCount,
        tables: tableCount,
    };
}
