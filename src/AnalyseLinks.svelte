<script>
    import { onMount } from "svelte";

    let analysisResults = [];
    let listOfUrls = "";

    async function fetchAnalysis() {
        // Get the starting URL from the input
        const response = await fetch(
            `/api/analyseLinks?startingPage=${encodeURIComponent(startingPage)}`,
        );
        const data = await response.json();
        console.log("data", data);
        analysisResults = data;
    }

    // Trigger the analysis when the component mounts
    onMount(() => {
        //fetchAnalysis();
        listOfUrls = localStorage.getItem("listOfUrls");
    });

    const newListOfUrls = (e) => {
        //console.log("newListOfUrls", e.target.value);
        localStorage.setItem("listOfUrls", e.target.value);
    };
</script>

<main>
    <h1>Analyze Outbound Links</h1>
    <textarea
        type="text"
        bind:value={listOfUrls}
        placeholder="Enter a starting URL"
        onchange={newListOfUrls}
    ></textarea>

    <button onclick={fetchAnalysis}>Analyze</button>

    {#if (analysisResults ?? []).length > 0}
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
    {:else}
        {analysisResults}
    {/if}
</main>

<style>
    /* Add some styles to make the page look nice */
    main {
        font-family: Arial, sans-serif;
        padding: 20px;
    }
    input,
    button {
        margin: 10px 0;
    }
    textarea {
        width: 100%;
        height: 16rem;
        margin-bottom: 20px;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        margin-bottom: 20px;
    }
</style>
