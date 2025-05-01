const params = new URLSearchParams(window.location.search);
const blockNumber = params.get("block");

let configData;

async function loadConfig() {
    try {
        const response = await fetch("../blockData/block" + blockNumber + ".json");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        configData = await response.json();
        console.log('Loaded config:', configData);

        const container = document.querySelector('.container');

        let header1 = document.createElement("div")
        header1.className = "header1";
        header1.append("Block " + blockNumber);
        let header2 = document.createElement("div")
        header2.className = "header2";


        let header3 = document.createElement("div")
        header3.className = "header3";
        let header3HTML = document.createElement("span")

        header3HTML.style.fontsize = "7px";
        header3HTML.innerHTML = "Learning Experiences -";

        header3.appendChild(header3HTML);
        header3.appendChild(document.createElement("br"));
        header3.append("What instructional strategies will be implemented?");
        header3.appendChild(document.createElement("br"));
        header3.append("What questions will be posed?");
        header3.appendChild(document.createElement("br"));
        header3.append("How will students engage/interact/think?");
        header3.appendChild(document.createElement("br"));


        let header4 = document.createElement("div")
        header4.className = "header4";
        let header4HTML = document.createElement("span")

        header4HTML.style.fontsize = "7px";
        header4HTML.innerHTML = "Timing -";
        header4.appendChild(header4HTML);

        header4.appendChild(document.createElement("br"));
        header4.append("How much time are you planning");
        header4.appendChild(document.createElement("br"));
        header4.append("for this component?");
        header4.appendChild(document.createElement("br"));

        container.appendChild(header1);
        container.appendChild(header2);
        container.appendChild(header3);
        container.appendChild(header4);

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