export class Team {
    constructor(teamNumber, teamName, preDistrictPoints, startingRank, impactEligible = false, engineeringInspirationEligible = false, rookieAllStarEligible = false) {
        this._draftOrder = NaN;
        this._earnedRegularAward = false;
        this._earnedImpactAward = false;
        this._earnedEIAward = false;
        this._earnedRookieAward = false;
        this._deWonAndParticipated = 0;
        this._deWon = 0;
        this._earned4th = false;
        this._earned3rd = false;
        this._earned2nd = false;
        this._earned1st = false;
        this._finalsMatchesWonAndParticipated = 0;
        this.teamNumber = teamNumber;
        this.teamName = teamName;
        this.preDistrictPoints = preDistrictPoints;
        this._qualifyingRank = startingRank;
        if (startingRank >= 1 && startingRank <= 8) {
            this._allianceCaptain = startingRank;
        }
        else {
            this._allianceCaptain = NaN;
        }
        this._districtRank = startingRank;
        this.impactEligible = impactEligible;
        this.engineeringInspirationEligible = engineeringInspirationEligible;
        this.rookieAllStarEligible = rookieAllStarEligible;
    }
    get qualifyingRank() {
        return this._qualifyingRank;
    }
    set qualifyingRank(value) {
        this._qualifyingRank = value;
    }
    get allianceCaptain() {
        return this._allianceCaptain;
    }
    set allianceCaptain(value) {
        this._allianceCaptain = value;
    }
    get draftOrder() {
        return this._draftOrder;
    }
    set draftOrder(value) {
        this._draftOrder = value;
    }
    get earnedRegularAward() {
        return this._earnedRegularAward;
    }
    set earnedRegularAward(value) {
        this._earnedRegularAward = value;
    }
    get earnedImpactAward() {
        return this._earnedImpactAward;
    }
    set earnedImpactAward(value) {
        if (this.impactEligible) {
            this._earnedImpactAward = value;
        }
    }
    get earnedEIAward() {
        return this._earnedEIAward;
    }
    set earnedEIAward(value) {
        if (this.engineeringInspirationEligible) {
            this._earnedEIAward = value;
        }
    }
    get earnedRookieAward() {
        return this._earnedRookieAward;
    }
    set earnedRookieAward(value) {
        if (this.rookieAllStarEligible) {
            this._earnedRookieAward = value;
        }
    }
    get earned1st() {
        return this._earned1st;
    }
    set earned1st(value) {
        this._earned1st = value;
    }
    get earned2nd() {
        return this._earned2nd;
    }
    set earned2nd(value) {
        this._earned2nd = value;
    }
    get earned3rd() {
        return this._earned3rd;
    }
    set earned3rd(value) {
        this._earned3rd = value;
    }
    get earned4th() {
        return this._earned4th;
    }
    set earned4th(value) {
        this._earned4th = value;
    }
    get deWon() {
        return this._deWon;
    }
    set deWon(value) {
        this._deWon = value;
    }
    get deWonAndParticipated() {
        return this._deWonAndParticipated;
    }
    set deWonAndParticipated(value) {
        this._deWonAndParticipated = value;
    }
    get finalsMatchesWonAndParticipated() {
        return this._finalsMatchesWonAndParticipated;
    }
    set finalsMatchesWonAndParticipated(value) {
        this._finalsMatchesWonAndParticipated = value;
    }
    get districtRank() {
        return this._districtRank;
    }
    set districtRank(value) {
        this._districtRank = value;
    }
    getAlliance() {
        if (!isNaN(this._allianceCaptain)) {
            return this._allianceCaptain;
        }
        else if (this._draftOrder >= 1 && this._draftOrder <= 8) {
            return this._draftOrder;
        }
        else if (this._draftOrder >= 9 && this._draftOrder <= 16) {
            return 16 - this._draftOrder + 1;
        }
        else {
            return NaN;
        }
    }
    getQualifyingPoints() {
        let firstInvERFArg = (Team.numberOfTeams - 2 * this.qualifyingRank + 2) / (Team.alpha * Team.numberOfTeams);
        let secondInvERFArg = (1.0 / Team.alpha);
        let firstInvERF = Team.invERF(firstInvERFArg);
        let secondInvERF = Team.invERF(secondInvERFArg);
        let newQP = firstInvERF * (10 / secondInvERF) + 12;
        return 3 * Math.max(4, Math.ceil(newQP));
    }
    getCaptainPoints() {
        if (!isNaN(this._allianceCaptain)) {
            return 3 * (17 - this._allianceCaptain);
        }
        else {
            return 0;
        }
    }
    getDraftOrderPoints() {
        if (!isNaN(this._draftOrder)) {
            return 3 * (17 - this._draftOrder);
        }
        else {
            return 0;
        }
    }
    getRegularAwardPoints() {
        if (this._earnedRegularAward) {
            return 3 * 5;
        }
        else {
            return 0;
        }
    }
    getImpactPoints() {
        if (this._earnedImpactAward) {
            return 3 * 10;
        }
        else {
            return 0;
        }
    }
    getEIPoints() {
        if (this._earnedEIAward) {
            return 3 * 8;
        }
        else {
            return 0;
        }
    }
    getRookiePoints() {
        if (this._earnedRookieAward) {
            return 3 * 8;
        }
        else {
            return 0;
        }
    }
    getPlayOffPerformancePoints() {
        if (this._earned4th) {
            return 7 * (this._deWonAndParticipated / this._deWon);
        }
        else if (this._earned3rd) {
            return 13 * (this._deWonAndParticipated / this._deWon);
        }
        else if (this._earned2nd) {
            return 20 * (this._deWonAndParticipated / this._deWon);
        }
        else if (this._earned1st) {
            return 20 * (this._deWonAndParticipated / this._deWon) + Math.min(10, 5 * this._finalsMatchesWonAndParticipated);
        }
        else {
            return 0;
        }
    }
    getDistrictPoints() {
        return this.preDistrictPoints
            + this.getQualifyingPoints()
            + this.getCaptainPoints()
            + this.getDraftOrderPoints()
            + this.getRegularAwardPoints()
            + this.getImpactPoints()
            + this.getEIPoints()
            + this.getRookiePoints()
            + this.getPlayOffPerformancePoints();
    }
    static invERF(x) {
        if (x <= -1 || x >= 1) {
            return NaN;
        }
        if (x === 0) {
            return 0;
        }
        const a = 0.147;
        const b = 2 / (Math.PI * a) + Math.log(1 - x * x) / 2;
        const sqrt1 = Math.sqrt(b * b - Math.log(1 - x * x) / a);
        return Math.sqrt(sqrt1 - b) * (x >= 0 ? 1 : -1);
    }
}
Team.numberOfTeams = 38;
Team.alpha = 1.07;
