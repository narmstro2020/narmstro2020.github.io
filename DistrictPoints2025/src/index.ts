import {Team} from "./team";

let storedArray = sessionStorage.getItem('myArray');
let stateTeams;
if (storedArray) {
    stateTeams = JSON.parse(storedArray) as Team[];
} else {
    stateTeams = [
        new Team(7457, "suPURDUEper Robotics", 146, 1),
        new Team(868, "TechHOUNDS", 146, 2, false, true, false),
        new Team(1501, "Team THRUST", 145, 3),
        new Team(4272, "Maverick Robotics", 124, 4),
        new Team(3940, "CyberTooth", 115, 5),
        new Team(461, "Westside Boiler Invasion", 112, 6, true, false, false),
        new Team(45, "TechnoKats Robotics Team", 104, 7),
        new Team(7617, "RoboBlazers", 97, 8),
        new Team(1741, "Red Alert", 97, 9, true, false, false),
        new Team(10021, "Guerin Catholic Golden Gears", 93, 10, false, false, true),
        new Team(135, "Penn Robotics Black Knights", 91, 11, true, true, false),
        new Team(7454, "Huskies on Hogs", 86, 12, true, false, false),
        new Team(234, "Cyber Blue", 82, 13, false, true, false),
        new Team(3494, "The Quadrangles", 82, 14),
        new Team(3176, "Purple Precision", 77, 15),
        new Team(829, "The Digital Goats", 75, 16),
        new Team(10332, "Carroll Charger Robotics", 74, 17),
        new Team(5010, "Tiger Dynasty", 74, 18),
        new Team(4485, "Tribe Tech Robotics", 67, 19),
        new Team(5484, "Career Academy Robotics - Wolf Pack", 67, 20),
        new Team(1024, "Kil-A-Bytes", 67, 21),
        new Team(5402, "Wreckless Robotics", 63, 22),
        new Team(292, "PantherTech", 62, 23),
        new Team(4926, "GalacTech", 62, 24),
        new Team(10492, "Bosse BYTEForce", 61, 25, false, false, true),
        new Team(6721, "Tindley Trailblazers", 59, 26),
        new Team(8430, "The Hatch Batch", 57, 27),
        new Team(8103, "Knight Robotics", 55, 28),
        new Team(6956, "SHAM-ROCK-BOTICS ☘", 53, 29),
        new Team(328, "Penn Robotics Golden Rooks", 53, 30),
        new Team(3487, "Red Pride Robotics", 52, 31),
        new Team(2197, "Las Pumas", 51, 32),
        new Team(1018, "Pike RoboDevils", 51, 33),
        new Team(5188, "Area 5188: Classified Robotics", 49, 34),
        new Team(2171, "RoboDogs", 49, 35),
        new Team(1747, "Harrison Boiler Robotics", 48, 36),
        new Team(447, "Team Roboto", 47, 37),
        new Team(7657, "ThunderBots", 47, 38, false, true, false),
        new Team(10029, "The Portotypes", NaN, NaN, false, false, true)
    ]; // Default value if not found
    sessionStorage.setItem("StateTeams", JSON.stringify(stateTeams));
}

let impactSet = false;
let eiSet = false;
let rookieSet = false;
let fourthSet = false;
let thirdSet = false;
let secondSet = false;
let firstSet = false;
let sortByQual = true;
let sortByDistrictRank = false;

const table = document.getElementById("table");

function createHeaderRow() {
    const headerRow = document.createElement("div");
    headerRow.classList.add("header");


    const headerNumberColumn = document.createElement("div");
    headerNumberColumn.classList.add("numberColumn");
    headerNumberColumn.innerHTML = "Team Number";

    const headerNameColumn = document.createElement("div");
    headerNameColumn.classList.add("nameColumn");
    headerNameColumn.innerHTML = "Team Name";

    const headerPointsColumn = document.createElement("div");
    headerPointsColumn.classList.add("pointsColumn");
    headerPointsColumn.innerHTML = "Points";

    const headerImpactColumn = document.createElement("div");
    headerImpactColumn.classList.add("impactColumn");
    headerImpactColumn.innerHTML = "Impact Eligible";

    const headerEIColumn = document.createElement("div");
    headerEIColumn.classList.add("EIColumn");
    headerEIColumn.innerHTML = "Engineering Inspiration Eligible";

    const headerRookieColumn = document.createElement("div");
    headerRookieColumn.classList.add("rookieColumn");
    headerRookieColumn.innerHTML = "Rookie All Star Eligible";

    const headerQualRank = document.createElement("div");
    headerQualRank.classList.add("qualRankColumn");
    headerQualRank.innerHTML = "Qualifying Rank";
    headerQualRank.style.setProperty("background-color", "black");
    const qualSort = document.createElement("input")
    qualSort.id = "qualSort";
    qualSort.style.border = "1px solid black";
    qualSort.checked = sortByQual;
    qualSort.type = "checkbox";
    qualSort.addEventListener("change", () => {
        sortByQual = qualSort.checked;
        sortByDistrictRank = !qualSort.checked;
        let element = document.getElementById("districtSort") as HTMLInputElement;
        if (element !== null) {
            element.checked = sortByDistrictRank;
        }
        updateRows();
    });
    headerQualRank.appendChild(qualSort);


    const headerQP = document.createElement("div");
    headerQP.classList.add("qpRankColumn");
    headerQP.innerHTML = "Qualifying Points";

    const headerCaptain = document.createElement("div");
    headerCaptain.classList.add("captainColumn");
    headerCaptain.innerHTML = "Captain of Alliance";

    const headerCaptainPoints = document.createElement("div");
    headerCaptainPoints.classList.add("captainPointsColumn");
    headerCaptainPoints.innerHTML = "Captain Points";

    const headerDraft = document.createElement("div");
    headerDraft.classList.add("draftPick");
    headerDraft.innerHTML = "Draft Pick #";

    const headerDraftPoints = document.createElement("div");
    headerDraftPoints.classList.add("draftPointsColumn");
    headerDraftPoints.innerHTML = "Draft Points";

    const headerAlliance = document.createElement("div");
    headerAlliance.classList.add("allianceColumn");
    headerAlliance.innerHTML = "Alliance #";

    const headerRegularAward = document.createElement("div");
    headerRegularAward.classList.add("awardColumn");
    headerRegularAward.innerHTML = "Regular Award";

    const headerRegularAwardPoints = document.createElement("div");
    headerRegularAwardPoints.classList.add("awardPointsColumn");
    headerRegularAwardPoints.innerHTML = "Regular Award Points";

    const headerImpactAward = document.createElement("div");
    headerImpactAward.classList.add("impactAwardColumn");
    headerImpactAward.innerHTML = "Earned Impact";

    const headerImpactAwardPoints = document.createElement("div");
    headerImpactAwardPoints.classList.add("impactAwardPointsColumn");
    headerImpactAwardPoints.innerHTML = "Impact Award Points";

    const headerEIAward = document.createElement("div");
    headerEIAward.classList.add("eiAwardColumn");
    headerEIAward.innerHTML = "Earned Engineering Inspiration";

    const headerEIAwardPoints = document.createElement("div");
    headerEIAwardPoints.classList.add("eiAwardPointsColumn");
    headerEIAwardPoints.innerHTML = "Engineering Inspiration Points";

    const headerRookieAward = document.createElement("div");
    headerRookieAward.classList.add("rookieAwardColumn");
    headerRookieAward.innerHTML = "Earned Rookie All Star";

    const headerRookieAwardPoints = document.createElement("div");
    headerRookieAwardPoints.classList.add("rookieAwardColumnPoints");
    headerRookieAwardPoints.innerHTML = "Rookie All Star Points";

    const headerWon = document.createElement("div");
    headerWon.classList.add("won");
    headerWon.innerHTML = "DE Won";

    const headerPart = document.createElement("div");
    headerPart.classList.add("part");
    headerPart.innerHTML = "DE Participated";

    const header4thPlace = document.createElement("div");
    header4thPlace.classList.add("4thPlaceColumn");
    header4thPlace.innerHTML = "4th Place";

    const header4thPlacePoints = document.createElement("div");
    header4thPlacePoints.classList.add("4thPlacePointsColumn");
    header4thPlacePoints.innerHTML = "4th Place Points";

    const header3rdPlace = document.createElement("div");
    header3rdPlace.classList.add("3rdPlaceColumn");
    header3rdPlace.innerHTML = "3rd Place";

    const header3rdPlacePoints = document.createElement("div");
    header3rdPlacePoints.classList.add("3rdPlacePointsColumn");
    header3rdPlacePoints.innerHTML = "3rd Place Points";

    const header2ndPlace = document.createElement("div");
    header2ndPlace.classList.add("2ndPlaceColumn");
    header2ndPlace.innerHTML = "2nd Place";

    const header2ndPlacePoints = document.createElement("div");
    header2ndPlacePoints.classList.add("2ndPlacePointsColumn");
    header2ndPlacePoints.innerHTML = "2nd Place Points";

    const header1stPlace = document.createElement("div");
    header1stPlace.classList.add("1stPlaceColumn");
    header1stPlace.innerHTML = "1st Place";

    const headerFinalsPart = document.createElement("div");
    headerFinalsPart.classList.add("finalsPart");
    headerFinalsPart.innerHTML = "Finals Matches Participated";

    const header1stPlacePoints = document.createElement("div");
    header1stPlacePoints.classList.add("1stPlacePointsColumn");
    header1stPlacePoints.innerHTML = "1st Place Points";

    const headerTotalDP = document.createElement("div");
    headerTotalDP.classList.add("totalDPColumn");
    headerTotalDP.innerHTML = "Total DP";

    const headerRankColumn = document.createElement("div");
    headerRankColumn.classList.add("rankColumn");
    headerRankColumn.innerHTML = "Rank";
    headerRankColumn.style.setProperty("background-color", "black");
    const districtSort = document.createElement("input")
    districtSort.id = "districtSort";
    districtSort.style.border = "1px solid black";
    districtSort.checked = sortByDistrictRank;
    districtSort.type = "checkbox";
    districtSort.addEventListener("change", () => {
        sortByQual = !qualSort.checked;
        sortByDistrictRank = qualSort.checked;
        let element = document.getElementById("qualSort") as HTMLInputElement;
        if (element !== null) {
            element.checked = sortByQual;
        }
        updateRows();
    });
    headerRankColumn.appendChild(districtSort);


    headerRow.appendChild(headerNumberColumn);
    headerRow.appendChild(headerNameColumn);
    headerRow.appendChild(headerPointsColumn);
    headerRow.appendChild(headerImpactColumn);
    headerRow.appendChild(headerEIColumn);
    headerRow.appendChild(headerRookieColumn);
    headerRow.appendChild(headerQualRank);
    headerRow.appendChild(headerQP);
    headerRow.appendChild(headerCaptain);
    headerRow.appendChild(headerCaptainPoints);
    headerRow.appendChild(headerDraft);
    headerRow.appendChild(headerDraftPoints);
    headerRow.appendChild(headerAlliance);
    headerRow.appendChild(headerRegularAward);
    headerRow.appendChild(headerRegularAwardPoints);
    headerRow.appendChild(headerImpactAward);
    headerRow.appendChild(headerImpactAwardPoints);
    headerRow.appendChild(headerEIAward);
    headerRow.appendChild(headerEIAwardPoints);
    headerRow.appendChild(headerRookieAward);
    headerRow.appendChild(headerRookieAwardPoints);
    headerRow.appendChild(headerWon);
    headerRow.appendChild(headerPart);
    headerRow.appendChild(header4thPlace);
    headerRow.appendChild(header4thPlacePoints);
    headerRow.appendChild(header3rdPlace);
    headerRow.appendChild(header3rdPlacePoints);
    headerRow.appendChild(header2ndPlace);
    headerRow.appendChild(header2ndPlacePoints);
    headerRow.appendChild(header1stPlace);
    headerRow.appendChild(headerFinalsPart);
    headerRow.appendChild(header1stPlacePoints);
    headerRow.appendChild(headerTotalDP);
    headerRow.appendChild(headerRankColumn);


    table?.appendChild(headerRow);
}

function createRowContainer() {
    const rows = document.createElement("div");
    rows.classList.add("rows");
    table?.appendChild(rows);
    return rows;
}

createHeaderRow();
const rowsContainer = createRowContainer();


const toFirst = (teamNumber: number) => {
    const teamToUpdate = stateTeams.find(team => team.teamNumber === teamNumber);
    if (teamToUpdate !== undefined) {
        let oldRank = teamToUpdate.qualifyingRank;
        if (oldRank !== 1 || isNaN(oldRank)) {
            updateQualRanks(teamToUpdate, oldRank, 1);
        }
    }
}

const toLast = (teamNumber: number) => {
    const teamToUpdate = stateTeams.find(team => team.teamNumber === teamNumber);
    if (teamToUpdate !== undefined) {
        let oldRank = teamToUpdate.qualifyingRank;
        if (oldRank !== Team.numberOfTeams || isNaN(oldRank)) {
            updateQualRanks(teamToUpdate, oldRank, Team.numberOfTeams);
        }
    }
}

const incrementRank = (teamNumber: number) => {
    const teamToUpdate = stateTeams.find(team => team.teamNumber === teamNumber);
    if (teamToUpdate !== undefined) {
        let oldRank = teamToUpdate.qualifyingRank;
        if (oldRank !== 1 || isNaN(oldRank)) {
            updateQualRanks(teamToUpdate, oldRank, oldRank - 1);
        }
    }
}

const decrementRank = (teamNumber: number) => {
    const teamToUpdate = stateTeams.find(team => team.teamNumber === teamNumber);
    if (teamToUpdate !== undefined) {
        let oldRank = teamToUpdate.qualifyingRank;
        if (oldRank !== Team.numberOfTeams || isNaN(oldRank)) {
            updateQualRanks(teamToUpdate, oldRank, oldRank + 1);
        }
    }
}

const updateQualRanks = (teamToUpdate: Team, oldRank: number, newRank: number) => {
    if (oldRank > newRank) {
        for (let i = oldRank - 1; i >= newRank; i--) {
            let team = stateTeams.find(team => team.qualifyingRank === i);
            if (team !== undefined) {
                team.qualifyingRank = i + 1;
                if (team.qualifyingRank >= 1 && team.qualifyingRank <= 8) {
                    team.allianceCaptain = team.qualifyingRank;
                } else {
                    team.allianceCaptain = NaN;
                }
            }
        }
        teamToUpdate.qualifyingRank = newRank;
        if (teamToUpdate.qualifyingRank >= 1 && teamToUpdate.qualifyingRank <= 8) {
            teamToUpdate.allianceCaptain = teamToUpdate.qualifyingRank;
        } else {
            teamToUpdate.allianceCaptain = NaN;
        }
    } else if (oldRank < newRank) {
        for (let i = oldRank + 1; i <= newRank; i++) {
            let team = stateTeams.find(team => team.qualifyingRank === i);
            if (team !== undefined) {
                team.qualifyingRank = i - 1;
                if (team.qualifyingRank >= 1 && team.qualifyingRank <= 8) {
                    team.allianceCaptain = team.qualifyingRank;
                } else {
                    team.allianceCaptain = NaN;
                }
            }
        }
        teamToUpdate.qualifyingRank = newRank;
        if (teamToUpdate.qualifyingRank >= 1 && teamToUpdate.qualifyingRank <= 8) {
            teamToUpdate.allianceCaptain = teamToUpdate.qualifyingRank;
        } else {
            teamToUpdate.allianceCaptain = NaN;
        }
    }
    updateRows()
}

const updateDrafts = (teamToUpdate: Team, oldDraft: number, newDraft: number) => {
    if (oldDraft > newDraft) {
        for (let i = oldDraft - 1; i >= newDraft; i--) {
            const team = stateTeams.find(team => team.draftOrder === i);
            if (team !== undefined) {
                team.draftOrder = i + 1;
            }
        }
        teamToUpdate.draftOrder = newDraft;
    } else if (oldDraft < newDraft) {
        for (let i = oldDraft + 1; i <= newDraft; i++) {
            let team = stateTeams.find(team => team.draftOrder === i);
            if (team !== undefined) {
                team.draftOrder = i - 1;
            }
        }
        teamToUpdate.draftOrder = newDraft;
    } else if (isNaN(oldDraft) && !isNaN(newDraft)) {
        let oldCaptain = teamToUpdate.allianceCaptain >= 1 && teamToUpdate.allianceCaptain <= 8
            ? teamToUpdate.allianceCaptain
            : NaN;
        teamToUpdate.draftOrder = newDraft;
        teamToUpdate.allianceCaptain = NaN;
        if (!isNaN(oldCaptain) && oldCaptain < 8) {
            for (let i = oldCaptain + 1; i <= 8; i++) {
                const team = stateTeams.find(team => team.allianceCaptain === i);
                if (team !== undefined) {
                    team.allianceCaptain = i - 1;
                }
            }
            const seventh = stateTeams.find(team => team.allianceCaptain === 7);
            if (seventh !== undefined) {
                const newEigth = stateTeams.find(team => team.qualifyingRank === seventh.qualifyingRank + 1);
                if (newEigth !== undefined) {
                    newEigth.allianceCaptain = 8;
                }
            }
        } else if (oldCaptain === 8) {
            const newEigth = stateTeams.find(team => team.qualifyingRank === teamToUpdate.qualifyingRank + 1);
            if (newEigth !== undefined) {
                newEigth.allianceCaptain = 8;
            }
        }
    } else if (!isNaN(oldDraft) && isNaN(newDraft)) {
        let oldQualifyingRank = teamToUpdate.qualifyingRank >= 1 && teamToUpdate.qualifyingRank <= 8
            ? teamToUpdate.qualifyingRank - 1
            : NaN;
        let earlierTeam = stateTeams.find(team => team.qualifyingRank === oldQualifyingRank);
        let oldCaptain = earlierTeam !== undefined
            ? earlierTeam.allianceCaptain + 1
            : NaN;

        if (!isNaN(oldCaptain)) {
            const eigth = stateTeams.find(team => team.allianceCaptain === 8);
            if (eigth !== undefined) {
                eigth.allianceCaptain = NaN;

            }
            for (let i = 7; i >= oldCaptain; i--) {
                const team = stateTeams.find(team => team.allianceCaptain === i);
                if (team !== undefined) {
                    team.allianceCaptain = i + 1;
                }
            }
        }
        teamToUpdate.draftOrder = newDraft;
        teamToUpdate.allianceCaptain = oldCaptain >= 1 && oldCaptain <= 8
            ? teamToUpdate.allianceCaptain = oldCaptain
            : NaN;
    }


    updateRows()

}


const updateRows = () => {
    stateTeams.sort((a, b) => {
        if (a.getDistrictPoints() > b.getDistrictPoints()) {
            return -1;
        } else if (a.getDistrictPoints() < b.getDistrictPoints()) {
            return 1;
        }
        return 0
    })
    stateTeams.forEach((team, index) => team.districtRank = index + 1);

    if (sortByQual) {
        stateTeams.sort((a, b) => {
            if (a.qualifyingRank > b.qualifyingRank) {
                return 1;
            } else if (a.qualifyingRank < b.qualifyingRank) {
                return -1;
            }
            return 0;
        })
    } else {
        stateTeams.sort((a, b) => {
            if (a.districtRank > b.districtRank) {
                return 1;
            } else if (a.districtRank < b.districtRank) {
                return -1;
            }
            return 0;
        })
    }

    rowsContainer.innerHTML = "";
    stateTeams.forEach((team, index) => {
        const newRow = document.createElement("div");
        newRow.classList.add("row");


        const newNumber = document.createElement("div");
        newNumber.classList.add("number");
        newNumber.innerHTML = String(team.teamNumber);

        const newName = document.createElement("div");
        newName.classList.add("name");
        newName.innerHTML = String(team.teamName);


        const newPoints = document.createElement("div");
        newPoints.classList.add("points");
        newPoints.innerHTML = String(team.preDistrictPoints);
        if (isNaN(team.preDistrictPoints)) {
            newPoints.innerHTML = "";
            newPoints.style.setProperty("background-color", "black");
        }


        const newImpact = document.createElement("div");
        newImpact.classList.add("impact");
        if (team.impactEligible) {
            newImpact.innerHTML = "✓";
            newImpact.style.setProperty("background-color", "#ffffff");
        }


        const newEI = document.createElement("div");
        newEI.classList.add("ei");
        if (team.engineeringInspirationEligible) {
            newEI.innerHTML = "✓";
            newEI.style.setProperty("background-color", "#ffffff");
        }


        const newRookie = document.createElement("div");
        newRookie.classList.add("rookie");
        if (team.rookieAllStarEligible) {
            newRookie.innerHTML = "✓";
            newRookie.style.setProperty("background-color", "#ffffff");
        }

        const newQualifyingRank = document.createElement("div");
        newQualifyingRank.classList.add("qualifyingRank");
        if (isNaN(team.qualifyingRank)) {
            newQualifyingRank.innerHTML = "";
            newQualifyingRank.style.setProperty("background-color", "black");
        } else {
            const incrementButton = document.createElement("button");
            incrementButton.classList.add("increment");
            incrementButton.innerHTML = "+";

            incrementButton.addEventListener("click", () => {
                incrementRank(team.teamNumber);
            });


            const decrementButton = document.createElement("button");
            decrementButton.classList.add("decrement");
            decrementButton.innerHTML = "-";
            decrementButton.addEventListener("click", () => {
                decrementRank(team.teamNumber);
            });

            const toFirstButton = document.createElement("button");
            toFirstButton.classList.add("toFirst");
            toFirstButton.innerHTML = "1";
            toFirstButton.addEventListener("click", () => {
                toFirst(team.teamNumber);
            })

            const toLastButton = document.createElement("button");
            toLastButton.classList.add("toLast");
            toLastButton.innerHTML = String(Team.numberOfTeams);
            toLastButton.addEventListener("click", () => {
                toLast(team.teamNumber);
            })


            const qual = document.createElement("p")
            qual.id = "qual" + "-" + String(team.teamNumber);
            qual.style.border = "1px solid black";
            qual.innerHTML = !isNaN(team.qualifyingRank) ? String(team.qualifyingRank) : "";
            newQualifyingRank.appendChild(qual);
            newQualifyingRank.append(toFirstButton);
            newQualifyingRank.appendChild(incrementButton);
            newQualifyingRank.appendChild(decrementButton);
            newQualifyingRank.appendChild(toLastButton);
        }

        const newQP = document.createElement("div");
        newQP.classList.add("qp");
        if (isNaN(team.qualifyingRank)) {
            newQP.innerHTML = "";
            newQP.style.setProperty("background-color", "black");
        } else {
            newQP.innerHTML = String(team.getQualifyingPoints());
        }

        const newCaptain = document.createElement("div");
        newCaptain.classList.add("captain");
        if (isNaN(team.qualifyingRank) || isNaN(team.allianceCaptain)) {
            newCaptain.innerHTML = "";
            newCaptain.style.setProperty("background-color", "black");
        } else {
            newCaptain.innerHTML = String(team.allianceCaptain);
        }

        const newCaptainPoints = document.createElement("div");
        newCaptainPoints.classList.add("captainPoints");
        if (isNaN(team.qualifyingRank) || isNaN(team.allianceCaptain)) {
            newCaptainPoints.innerHTML = "";
            newCaptainPoints.style.setProperty("background-color", "black");
        } else {
            newCaptainPoints.innerHTML = String(team.getCaptainPoints());
        }

        const newDraftPick = document.createElement("div");
        newDraftPick.classList.add("qualifyingRank");
        if (isNaN(team.qualifyingRank)) {
            newDraftPick.innerHTML = "";
            newDraftPick.style.setProperty("background-color", "black");
        } else {
            const draft = document.createElement("input")
            draft.id = "draft" + "-" + String(team.teamNumber);
            draft.style.border = "1px solid black";
            draft.value = isNaN(team.draftOrder) ? "" : String(team.draftOrder);
            draft.type = "text";
            draft.addEventListener("change", () => {
                if (draft.value === undefined || draft.value === "") {
                    updateDrafts(team, team.draftOrder, NaN);
                } else {
                    updateDrafts(team, team.draftOrder, Number(draft.value))
                }
            });
            newDraftPick.appendChild(draft);
        }

        const newDraftPoints = document.createElement("div");
        newDraftPoints.classList.add("draftPoints");
        if (isNaN(team.qualifyingRank) || isNaN(team.draftOrder)) {
            newDraftPoints.innerHTML = "";
            newDraftPoints.style.setProperty("background-color", "black");
        } else {
            newDraftPoints.innerHTML = String(team.getDraftOrderPoints());
        }

        const newAlliance = document.createElement("div");
        newAlliance.classList.add("alliance");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance())) {
            newAlliance.innerHTML = "";
            newAlliance.style.setProperty("background-color", "black");
        } else {
            newAlliance.innerHTML = String(team.getAlliance());
        }

        const newRegularAward = document.createElement("div");
        newRegularAward.classList.add("award");
        if (isNaN(team.qualifyingRank)) {
            newRegularAward.innerHTML = "";
            newRegularAward.style.setProperty("background-color", "black");
        } else {
            const award = document.createElement("input")
            award.id = "award" + "-" + String(team.teamNumber);
            award.style.border = "1px solid black";
            award.checked = team.earnedRegularAward;
            award.type = "checkbox";
            award.addEventListener("change", () => {
                team.earnedRegularAward = award.checked;
                updateRows();
            });
            newRegularAward.appendChild(award);
        }

        const newRegularAwardPoints = document.createElement("div");
        newRegularAwardPoints.classList.add("awardPoints");
        if (isNaN(team.qualifyingRank)) {
            newRegularAwardPoints.innerHTML = "";
            newRegularAwardPoints.style.setProperty("background-color", "black");
        } else {
            newRegularAwardPoints.innerHTML = String(team.getRegularAwardPoints());
        }

        const newImpactAward = document.createElement("div");
        newImpactAward.classList.add("earnedImpact");
        if (isNaN(team.qualifyingRank) || !team.impactEligible || (impactSet && !team.earnedImpactAward)) {
            newImpactAward.innerHTML = "";
            newImpactAward.style.setProperty("background-color", "black");
        } else {
            const impactAward = document.createElement("input")
            impactAward.id = "impactAward" + "-" + String(team.teamNumber);
            impactAward.style.border = "1px solid black";
            impactAward.checked = team.earnedImpactAward;
            impactAward.type = "checkbox";
            impactAward.addEventListener("change", () => {
                team.earnedImpactAward = impactAward.checked;
                impactSet = impactAward.checked;
                updateRows();
            });
            newImpactAward.appendChild(impactAward);
        }

        const newImpactAwardPoints = document.createElement("div");
        newImpactAwardPoints.classList.add("impactAwardPoints");
        if (isNaN(team.qualifyingRank) || !team.impactEligible || (impactSet && !team.earnedImpactAward)) {
            newImpactAwardPoints.innerHTML = "";
            newImpactAwardPoints.style.setProperty("background-color", "black");
        } else {
            newImpactAwardPoints.innerHTML = String(team.getImpactPoints());
        }

        const newEIAward = document.createElement("div");
        newEIAward.classList.add("earnedEI");
        if (isNaN(team.qualifyingRank) || !team.engineeringInspirationEligible || (eiSet && !team.earnedEIAward)) {
            newEIAward.innerHTML = "";
            newEIAward.style.setProperty("background-color", "black");
        } else {
            const eiAward = document.createElement("input")
            eiAward.id = "eiAward" + "-" + String(team.teamNumber);
            eiAward.style.border = "1px solid black";
            eiAward.checked = team.earnedEIAward;
            eiAward.type = "checkbox";
            eiAward.addEventListener("change", () => {
                team.earnedEIAward = eiAward.checked;
                eiSet = eiAward.checked;
                updateRows();
            });
            newEIAward.appendChild(eiAward);
        }

        const newEIAwardPoints = document.createElement("div");
        newEIAwardPoints.classList.add("eiAwardPoints");
        if (isNaN(team.qualifyingRank) || !team.engineeringInspirationEligible || (eiSet && !team.earnedEIAward)) {
            newEIAwardPoints.innerHTML = "";
            newEIAwardPoints.style.setProperty("background-color", "black");
        } else {
            newEIAwardPoints.innerHTML = String(team.getEIPoints());
        }

        const newRookieAward = document.createElement("div");
        newRookieAward.classList.add("earnedRookie");
        if (!team.rookieAllStarEligible || (rookieSet && !team.earnedRookieAward)) {
            newRookieAward.innerHTML = "";
            newRookieAward.style.setProperty("background-color", "black");
        } else {
            const rookieAward = document.createElement("input")
            rookieAward.id = "rookieAward" + "-" + String(team.teamNumber);
            rookieAward.style.border = "1px solid black";
            rookieAward.checked = team.earnedRookieAward;
            rookieAward.type = "checkbox";
            rookieAward.addEventListener("change", () => {
                team.earnedRookieAward = rookieAward.checked;
                rookieSet = rookieAward.checked;
                updateRows();
            });
            newRookieAward.appendChild(rookieAward);
        }

        const newRookieAwardPoints = document.createElement("div");
        newRookieAwardPoints.classList.add("rookieAwardPoints");
        if (isNaN(team.qualifyingRank) || !team.rookieAllStarEligible || (rookieSet && !team.earnedRookieAward)) {
            newRookieAwardPoints.innerHTML = "";
            newRookieAwardPoints.style.setProperty("background-color", "black");
        } else {
            newRookieAwardPoints.innerHTML = String(team.getRookiePoints());
        }

        const newWon = document.createElement("div");
        newWon.classList.add("won");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance())) {
            newWon.innerHTML = "";
            newWon.style.setProperty("background-color", "black");
        } else {
            const won = document.createElement("input")
            won.id = "won" + "-" + String(team.teamNumber);
            won.style.border = "1px solid black";
            won.value = String(team.deWon);
            won.type = "text";
            won.addEventListener("change", () => {
                team.deWon = Number(won.value);
                updateRows();
            });
            newWon.appendChild(won);
        }

        const newPart = document.createElement("div");
        newPart.classList.add("part");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance())) {
            newPart.innerHTML = "";
            newPart.style.setProperty("background-color", "black");
        } else {
            const part = document.createElement("input")
            part.id = "part" + "-" + String(team.teamNumber);
            part.style.border = "1px solid black";
            part.value = String(team.deWonAndParticipated);
            part.type = "text";
            part.addEventListener("change", () => {
                team.deWonAndParticipated = Number(part.value);
                updateRows();
            });
            newPart.appendChild(part);
        }

        const new4th = document.createElement("div");
        new4th.classList.add("4th");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || (fourthSet && !team.earned4th)) {
            new4th.innerHTML = "";
            new4th.style.setProperty("background-color", "black");
        } else {
            const fourth = document.createElement("input")
            fourth.id = "fourth" + "-" + String(team.teamNumber);
            fourth.style.border = "1px solid black";
            fourth.checked = team.earned4th;
            fourth.type = "checkbox";
            fourth.addEventListener("change", () => {
                team.earned4th = fourth.checked;
                fourthSet = fourth.checked;
                team.deWon = fourth.checked ? 2 : 0;
                updateRows();
            });
            new4th.appendChild(fourth);
        }

        const new4thPoints = document.createElement("div");
        new4thPoints.classList.add("forthPoints");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || (fourthSet && !team.earned4th)) {
            new4thPoints.innerHTML = "";
            new4thPoints.style.setProperty("background-color", "black");
        } else {
            new4thPoints.innerHTML = String(team.getPlayOffPerformancePoints());
        }

        const new3rd = document.createElement("div");
        new3rd.classList.add("3rd");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || (thirdSet && !team.earned3rd) || (fourthSet && team.earned4th)) {
            new3rd.innerHTML = "";
            new3rd.style.setProperty("background-color", "black");
        } else {
            const third = document.createElement("input")
            third.id = "third" + "-" + String(team.teamNumber);
            third.style.border = "1px solid black";
            third.checked = team.earned3rd;
            third.type = "checkbox";
            third.addEventListener("change", () => {
                team.earned3rd = third.checked;
                thirdSet = third.checked;
                team.deWon = third.checked ? 3 : 0;
                updateRows();
            });
            new3rd.appendChild(third);
        }

        const new3rdPoints = document.createElement("div");
        new3rdPoints.classList.add("forthPoints");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || (thirdSet && !team.earned3rd) || (fourthSet && team.earned4th)) {
            new3rdPoints.innerHTML = "";
            new3rdPoints.style.setProperty("background-color", "black");
        } else {
            new3rdPoints.innerHTML = String(team.getPlayOffPerformancePoints());
        }

        const new2nd = document.createElement("div");
        new2nd.classList.add("2nd");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || (secondSet && !team.earned2nd) || (fourthSet && team.earned4th) || (thirdSet && team.earned3rd)) {
            new2nd.innerHTML = "";
            new2nd.style.setProperty("background-color", "black");
        } else {
            const second = document.createElement("input")
            second.id = "second" + "-" + String(team.teamNumber);
            second.style.border = "1px solid black";
            second.checked = team.earned2nd;
            second.type = "checkbox";
            second.addEventListener("change", () => {
                team.earned2nd = second.checked;
                secondSet = second.checked;
                updateRows();
            });
            new2nd.appendChild(second);
        }

        const new2ndPoints = document.createElement("div");
        new2ndPoints.classList.add("forthPoints");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || (secondSet && !team.earned2nd) || (fourthSet && team.earned4th) || (thirdSet && team.earned3rd)) {
            new2ndPoints.innerHTML = "";
            new2ndPoints.style.setProperty("background-color", "black");
        } else {
            new2ndPoints.innerHTML = String(team.getPlayOffPerformancePoints());
        }

        const new1st = document.createElement("div");
        new1st.classList.add("1st");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || (firstSet && !team.earned1st) || (fourthSet && team.earned4th) || (thirdSet && team.earned3rd) || (secondSet && team.earned2nd)) {
            new1st.innerHTML = "";
            new1st.style.setProperty("background-color", "black");
        } else {
            const first = document.createElement("input")
            first.id = "first" + "-" + String(team.teamNumber);
            first.style.border = "1px solid black";
            first.checked = team.earned1st;
            first.type = "checkbox";
            first.addEventListener("change", () => {
                team.earned1st = first.checked;
                firstSet = first.checked;
                updateRows();
            });
            new1st.appendChild(first);
        }

        const newFinalsPart = document.createElement("div");
        newFinalsPart.classList.add("finalsPart");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || !team.earned1st) {
            newFinalsPart.innerHTML = "";
            newFinalsPart.style.setProperty("background-color", "black");
        } else {
            const finalsPart = document.createElement("input")
            finalsPart.id = "finalsPart" + "-" + String(team.teamNumber);
            finalsPart.style.border = "1px solid black";
            finalsPart.value = String(team.finalsMatchesWonAndParticipated);
            finalsPart.type = "text";
            finalsPart.addEventListener("change", () => {
                team.finalsMatchesWonAndParticipated = Number(finalsPart.value);

                updateRows();
            });
            newFinalsPart.appendChild(finalsPart);
        }

        const new1stPoints = document.createElement("div");
        new1stPoints.classList.add("forthPoints");
        if (isNaN(team.qualifyingRank) || isNaN(team.getAlliance()) || (firstSet && !team.earned1st) || (fourthSet && team.earned4th) || (thirdSet && team.earned3rd) || (secondSet && team.earned2nd)) {
            new1stPoints.innerHTML = "";
            new1stPoints.style.setProperty("background-color", "black");
        } else {
            new1stPoints.innerHTML = String(team.getPlayOffPerformancePoints());
        }

        const newTP = document.createElement("div");
        newTP.classList.add("totalPoints");
        if (isNaN(team.qualifyingRank)) {
            newTP.innerHTML = "";
            newTP.style.setProperty("background-color", "black");
        } else {
            newTP.innerHTML = String(team.getDistrictPoints());
        }

        const newRank = document.createElement("div")
        newRank.classList.add("rank");
        newRank.innerHTML = String(team.districtRank);
        if (isNaN(team.getDistrictPoints())) {
            newRank.innerHTML = "";
            newRank.style.setProperty("background-color", "black");
        }

        newRow.appendChild(newNumber);
        newRow.appendChild(newName);
        newRow.appendChild(newPoints);
        newRow.appendChild(newImpact);
        newRow.appendChild(newEI);
        newRow.appendChild(newRookie);
        newRow.appendChild(newQualifyingRank);
        newRow.appendChild(newQP);
        newRow.appendChild(newCaptain);
        newRow.appendChild(newCaptainPoints);
        newRow.appendChild(newDraftPick);
        newRow.appendChild(newDraftPoints);
        newRow.appendChild(newAlliance);
        newRow.appendChild(newRegularAward);
        newRow.appendChild(newRegularAwardPoints);
        newRow.appendChild(newImpactAward);
        newRow.appendChild(newImpactAwardPoints);
        newRow.appendChild(newEIAward);
        newRow.appendChild(newEIAwardPoints);
        newRow.appendChild(newRookieAward);
        newRow.appendChild(newRookieAwardPoints);
        newRow.appendChild(newWon);
        newRow.appendChild(newPart);
        newRow.appendChild(new4th);
        newRow.appendChild(new4thPoints);
        newRow.appendChild(new3rd);
        newRow.appendChild(new3rdPoints);
        newRow.appendChild(new2nd);
        newRow.appendChild(new2ndPoints);
        newRow.appendChild(new1st);
        newRow.append(newFinalsPart);
        newRow.appendChild(new1stPoints);
        newRow.appendChild(newTP);
        newRow.appendChild(newRank);

        rowsContainer?.appendChild(newRow);
    });
}


updateRows();




