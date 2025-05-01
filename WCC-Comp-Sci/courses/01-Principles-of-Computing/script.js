let configData;

const container = document.querySelector('.container');

async function loadConfig() {

    function goToBlockPage(block) {
        return function () {
            window.location.href = `./block/block.html?block=${encodeURIComponent(block)}`;
        };
    }

    try {
        const response = await fetch('block_calendar.json');
        if (!response.ok) {
            throw new Error('Error fetching block_calendar.json');
        }

        configData = await response.json();

        console.log("Loaded config:", configData);

        const header1 = document.createElement("div");
        const header2 = document.createElement("div");
        const header3 = document.createElement("div");
        const header4 = document.createElement("div");
        const header5 = document.createElement("div");
        const header6 = document.createElement("div");

        header1.innerHTML = "Block #";
        header2.innerHTML = "Black Date";
        header3.innerHTML = "Gold Date";
        header4.innerHTML = "Unit";
        header5.innerHTML = "Lesson";
        header6.innerHTML = "W.A.R.R.I.O.R Protocol";

        container.appendChild(header1);
        container.appendChild(header2);
        container.appendChild(header3);
        container.appendChild(header4);
        container.appendChild(header5);
        container.appendChild(header6);

        for (let i = 0; i < configData.length; i++) {
            const col1 = document.createElement("div");
            const col2 = document.createElement("div");
            const col3 = document.createElement("div");
            const col4 = document.createElement("div");
            const col5 = document.createElement("div");
            const col6 = document.createElement("div");

            col1.innerHTML = configData[i]["block"];
            col2.innerHTML = configData[i]["black_date"];
            col3.innerHTML = configData[i]["gold_date"];
            col4.innerHTML = configData[i]["unit"];
            col5.innerHTML = configData[i]["lesson"];
            const link = document.createElement("span");
            link.onclick = goToBlockPage(configData[i]["block"]);
            link.innerHTML = "link";
            col6.appendChild(link);

            container.appendChild(col1);
            container.appendChild(col2);
            container.appendChild(col3);
            container.appendChild(col4);
            container.appendChild(col5);
            container.appendChild(col6);
        }


    } catch (error) {
        console.error('Error loading JSON:', error);

    }
}

loadConfig();









