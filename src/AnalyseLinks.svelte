<script>
    import { onMount } from 'svelte';
    let startingPage = 'https://kenpower.com/'; // The starting page URL
    let analysisResults = [];

    async function fetchAnalysis() {
        const response = await fetch(`/api/analyseLinks?startingPage=${encodeURIComponent(startingPage)}`);
        const data = await response.json();
        analysisResults = data.results;
    }

    // Trigger the analysis when the component mounts
    onMount(() => {
        fetchAnalysis();
    });
</script>

<main>
    <h1>Analyze Outbound Links</h1>
    <input type="text" bind:value={startingPage} placeholder="Enter a starting URL" />
    <button on:click={fetchAnalysis}>Analyze</button>

    {#if analysisResults.length > 0}
        <ul>
            {#each analysisResults as { link, visibleWords, images, tables }}
                <li>
                    <strong>{link}</strong><br />
                    Visible Words: {visibleWords} <br />
                    Images: {images} <br />
                    Tables: {tables}
                </li>
            {/each}
        </ul>
    {/if}
</main>

<style>
    /* Add some styles to make the page look nice */
    main {
        font-family: Arial, sans-serif;
        padding: 20px;
    }
    input, button {
        margin: 10px 0;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        margin-bottom: 20px;
    }
</style>
