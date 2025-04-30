let configData;

async function loadConfig() {
    try {
        const response = await fetch('blockdata.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        configData = await response.json();
        console.log('Loaded config:', configData);
        
        const welcome = document.getElementById('welcome');
        const welcomeTiming = document.getElementById('welcome-timing');
        welcome.innerHTML = configData["welcome"]["data"];
        welcomeTiming.innerHTML = configData["welcome"]["time"];

        const aim = document.getElementById('aim');
        const aimTiming = document.getElementById('aim-timing');
        aim.innerHTML = configData["aim"]["data"];
        aimTiming.innerHTML = configData["aim"]["time"];

        const review = document.getElementById('review');
        const reviewTiming = document.getElementById('review-timing');
        review.innerHTML = configData["review"]["data"];
        reviewTiming.innerHTML = configData["review"]["time"];

        const relevant = document.getElementById('relevant');
        const relevantTiming = document.getElementById('relevant-timing');
        relevant.innerHTML = configData["relevant"]["data"];
        relevantTiming.innerHTML = configData["relevant"]["time"];

        const interactive = document.getElementById('interactive');
        const interactiveTiming = document.getElementById('interactive-timing');
        interactive.innerHTML = configData["interactive"]["data"];
        interactiveTiming.innerHTML = configData["interactive"]["time"];

        const ownership = document.getElementById('ownership');
        const ownershipTiming = document.getElementById('ownership-timing');
        ownership.innerHTML = configData["ownership"]["data"];
        ownershipTiming.innerHTML = configData["ownership"]["time"];

        const resonate = document.getElementById('resonate');
        const resonateTiming = document.getElementById('resonate-timing');
        resonate.innerHTML = configData["resonate"]["data"];
        resonateTiming.innerHTML = configData["resonate"]["time"];

        const supplies = document.getElementById('supplies');
        const suppliesTiming = document.getElementById('supplies-timing');
        supplies.innerHTML = configData["supplies"]["data"];
        suppliesTiming.innerHTML = configData["supplies"]["time"];
        
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

loadConfig();