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

        const welcome1 = document.createElement("div")
        welcome1.className = "col1";
        welcome1.innerHTML = "W";

        const welcome2 = document.createElement("div")
        welcome2.className = "col2";
        let welcome2HTML = document.createElement("span")
        welcome2HTML.className = "col2-span";
        welcome2HTML.innerHTML = "Welcome -";

        welcome2.appendChild(welcome2HTML);
        welcome2.appendChild(document.createElement("br"));
        welcome2.append("How will you");
        welcome2.appendChild(document.createElement("br"));
        welcome2.append("welcome and");
        welcome2.appendChild(document.createElement("br"));
        welcome2.append("warm-up for the");
        welcome2.appendChild(document.createElement("br"));
        welcome2.append("block?");

        const welcome3 = document.createElement("div")
        welcome3.className = "col3";
        welcome3.id = "welcome";
        welcome3.innerHTML = configData["welcome"]["data"];

        const welcome4 = document.createElement("div")
        welcome4.className = "col4";
        welcome4.id = "welcome-timing";
        welcome4.innerHTML = configData["welcome"]["time"];


        container.appendChild(welcome1);
        container.appendChild(welcome2);
        container.appendChild(welcome3);
        container.appendChild(welcome4);

        const aim1 = document.createElement("div")
        aim1.className = "col1";
        aim1.innerHTML = "A";

        const aim2 = document.createElement("div")
        aim2.className = "col2";
        let aim2HTML = document.createElement("span")
        aim2HTML.className = "col2-span";
        aim2HTML.innerHTML = "Aim -";

        aim2.appendChild(aim2HTML);
        aim2.appendChild(document.createElement("br"));
        aim2.append("How will you set your agenda/ objective for the block?");

        const aim3 = document.createElement("div")
        aim3.className = "col3";
        aim3.id = "aim";
        aim3.innerHTML = configData["aim"]["data"];

        const aim4 = document.createElement("div")
        aim4.className = "col4";
        aim4.id = "aim-timing";
        aim4.innerHTML = configData["aim"]["time"];

        container.appendChild(aim1);
        container.appendChild(aim2);
        container.appendChild(aim3);
        container.appendChild(aim4);

        const review1 = document.createElement("div")
        review1.className = "col1";
        review1.innerHTML = "R";

        const review2 = document.createElement("div")
        review2.className = "col2";
        let review2HTML = document.createElement("span")
        review2HTML.className = "col2-span";
        review2HTML.innerHTML = "Review -";

        review2.appendChild(review2HTML);
        review2.appendChild(document.createElement("br"));
        review2.append("How will you connect to the prior block’s learning?");

        const review3 = document.createElement("div")
        review3.className = "col3";
        review3.id = "review";
        review3.innerHTML = configData["review"]["data"];

        const review4 = document.createElement("div")
        review4.className = "col4";
        review4.id = "review-timing";
        review4.innerHTML = configData["review"]["time"];

        container.appendChild(review1);
        container.appendChild(review2);
        container.appendChild(review3);
        container.appendChild(review4);

        const relevant1 = document.createElement("div")
        relevant1.className = "col1";
        relevant1.innerHTML = "R";

        const relevant2 = document.createElement("div")
        relevant2.className = "col2";
        let relevant2HTML = document.createElement("span")
        relevant2HTML.className = "col2-span";
        relevant2HTML.innerHTML = "Relevant Instruction -";

        relevant2.appendChild(relevant2HTML);
        relevant2.appendChild(document.createElement("br"));
        relevant2.append("How will you deliver high quality relevant instruction?");

        const relevant3 = document.createElement("div")
        relevant3.className = "col3";
        relevant3.id = "relevant";
        relevant3.innerHTML = configData["relevant"]["data"];

        const relevant4 = document.createElement("div")
        relevant4.className = "col4";
        relevant4.id = "relevant-timing";
        relevant4.innerHTML = configData["relevant"]["time"];

        container.appendChild(relevant1);
        container.appendChild(relevant2);
        container.appendChild(relevant3);
        container.appendChild(relevant4);

        const interactive1 = document.createElement("div")
        interactive1.className = "col1";
        interactive1.innerHTML = "I";

        const interactive2 = document.createElement("div")
        interactive2.className = "col2";
        let interactive2HTML = document.createElement("span")
        interactive2HTML.className = "col2-span";
        interactive2HTML.innerHTML = "Interactive -";

        interactive2.appendChild(interactive2HTML);
        interactive2.appendChild(document.createElement("br"));
        interactive2.append("How will you engage students in interactive experiences and learning?");

        const interactive3 = document.createElement("div")
        interactive3.className = "col3";
        interactive3.id = "interactive";
        interactive3.innerHTML = configData["interactive"]["data"];

        const interactive4 = document.createElement("div")
        interactive4.className = "col4";
        interactive4.id = "interactive-timing";
        interactive4.innerHTML = configData["interactive"]["time"];

        container.appendChild(interactive1);
        container.appendChild(interactive2);
        container.appendChild(interactive3);
        container.appendChild(interactive4);

        const ownership1 = document.createElement("div")
        ownership1.className = "col1";
        ownership1.innerHTML = "O";

        const ownership2 = document.createElement("div")
        ownership2.className = "col2";
        let ownership2HTML = document.createElement("span")
        ownership2HTML.className = "col2-span";
        ownership2HTML.innerHTML = "Ownership -";

        ownership2.appendChild(ownership2HTML);
        ownership2.appendChild(document.createElement("br"));
        ownership2.append("How will you empower students to take ownership and apply their learning?");

        const ownership3 = document.createElement("div")
        ownership3.className = "col3";
        ownership3.id = "ownership";
        ownership3.innerHTML = configData["ownership"]["data"];

        const ownership4 = document.createElement("div")
        ownership4.className = "col4";
        ownership4.id = "ownership-timing";
        ownership4.innerHTML = configData["ownership"]["time"];

        container.appendChild(ownership1);
        container.appendChild(ownership2);
        container.appendChild(ownership3);
        container.appendChild(ownership4);

        const resonate1 = document.createElement("div")
        resonate1.className = "col1";
        resonate1.innerHTML = "R";

        const resonate2 = document.createElement("div")
        resonate2.className = "col2";
        let resonate2HTML = document.createElement("span")
        resonate2HTML.className = "col2-span";
        resonate2HTML.innerHTML = "Resonate -";

        resonate2.appendChild(resonate2HTML);
        resonate2.appendChild(document.createElement("br"));
        resonate2.append("How will you verify that the learning resonates with learners?\n");

        const resonate3 = document.createElement("div")
        resonate3.className = "col3";
        resonate3.id = "resonate";
        resonate3.innerHTML = configData["resonate"]["data"];

        const resonate4 = document.createElement("div")
        resonate4.className = "col4";
        resonate4.id = "resonate-timing";
        resonate4.innerHTML = configData["resonate"]["time"];

        container.appendChild(resonate1);
        container.appendChild(resonate2);
        container.appendChild(resonate3);
        container.appendChild(resonate4);

        const supplies1 = document.createElement("div")
        supplies1.className = "col1";
        supplies1.innerHTML = "S";

        const supplies2 = document.createElement("div")
        supplies2.className = "col2";
        let supplies2HTML = document.createElement("span")
        supplies2HTML.className = "col2-span";
        supplies2HTML.innerHTML = "Supplies -";

        supplies2.appendChild(supplies2HTML);
        supplies2.appendChild(document.createElement("br"));
        supplies2.append("What supplies, resources, and/or items are needed for this lesson?\n");

        const supplies3 = document.createElement("div")
        supplies3.className = "col3";
        supplies3.id = "supplies";
        supplies3.innerHTML = configData["supplies"]["data"];

        const supplies4 = document.createElement("div")
        supplies4.className = "col4";
        supplies4.id = "supplies-timing";
        supplies4.innerHTML = configData["supplies"]["time"];

        container.appendChild(supplies1);
        container.appendChild(supplies2);
        container.appendChild(supplies3);
        container.appendChild(supplies4);

        const supplies = document.getElementById('supplies');
        const suppliesTiming = document.getElementById('supplies-timing');
        supplies.innerHTML = configData["supplies"]["data"];
        suppliesTiming.innerHTML = "-";

    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

loadConfig();