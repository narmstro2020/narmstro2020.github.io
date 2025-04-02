export class Team {



    public static readonly numberOfTeams: number = 38;
    public static readonly alpha: number = 1.07;

    public readonly teamName: string;
    public readonly teamNumber: number;
    public readonly preDistrictPoints: number;
    public readonly impactEligible: boolean;
    public readonly engineeringInspirationEligible: boolean;
    public readonly rookieAllStarEligible: boolean;
    private _qualifyingRank: number;
    private _allianceCaptain: number;
    private _draftOrder: number = NaN;
    private _earnedRegularAward: boolean = false;
    private _earnedImpactAward: boolean = false;
    private _earnedEIAward: boolean = false;
    private _earnedRookieAward: boolean = false;
    private _deWonAndParticipated: number = 0;
    private _deWon: number = 0;
    private _earned4th: boolean = false;
    private _earned3rd: boolean = false;
    private _earned2nd: boolean = false;
    private _earned1st: boolean = false;
    private _finalsMatchesWonAndParticipated: number = 0;
    private _districtRank: number;


    constructor(
        teamNumber: number,
        teamName: string,
        preDistrictPoints: number,
        startingRank: number,
        impactEligible = false,
        engineeringInspirationEligible = false,
        rookieAllStarEligible = false) {
        this.teamNumber = teamNumber;
        this.teamName = teamName;
        this.preDistrictPoints = preDistrictPoints;
        this._qualifyingRank = startingRank;

        if (startingRank >= 1 && startingRank <= 8) {
            this._allianceCaptain = startingRank;
        } else {
            this._allianceCaptain = NaN;
        }

        this._districtRank = startingRank;

        this.impactEligible = impactEligible;
        this.engineeringInspirationEligible = engineeringInspirationEligible;
        this.rookieAllStarEligible = rookieAllStarEligible;
    }

    get qualifyingRank(): number {
        return this._qualifyingRank;
    }

    set qualifyingRank(value: number) {
        this._qualifyingRank = value;
    }

    get allianceCaptain(): number {
        return this._allianceCaptain;
    }

    set allianceCaptain(value: number) {
        this._allianceCaptain = value;
    }

    get draftOrder(): number {
        return this._draftOrder;
    }

    set draftOrder(value: number) {
        this._draftOrder = value;
    }

    get earnedRegularAward(): boolean {
        return this._earnedRegularAward;
    }

    set earnedRegularAward(value: boolean) {
        this._earnedRegularAward = value;
    }

    get earnedImpactAward(): boolean {
        return this._earnedImpactAward;
    }

    set earnedImpactAward(value: boolean) {
        if (this.impactEligible) {
            this._earnedImpactAward = value;
        }
    }

    get earnedEIAward(): boolean {
        return this._earnedEIAward;
    }

    set earnedEIAward(value: boolean) {
        if (this.engineeringInspirationEligible) {
            this._earnedEIAward = value;
        }
    }

    get earnedRookieAward(): boolean {
        return this._earnedRookieAward;
    }

    set earnedRookieAward(value: boolean) {
        if (this.rookieAllStarEligible) {
            this._earnedRookieAward = value;
        }
    }

    get earned1st(): boolean {
        return this._earned1st;
    }

    set earned1st(value: boolean) {
        this._earned1st = value;
    }

    get earned2nd(): boolean {
        return this._earned2nd;
    }

    set earned2nd(value: boolean) {
        this._earned2nd = value;
    }

    get earned3rd(): boolean {
        return this._earned3rd;
    }

    set earned3rd(value: boolean) {
        this._earned3rd = value;
    }

    get earned4th(): boolean {
        return this._earned4th;
    }

    set earned4th(value: boolean) {
        this._earned4th = value;
    }

    get deWon(): number {
        return this._deWon;
    }

    set deWon(value: number) {
        this._deWon = value;
    }

    get deWonAndParticipated(): number {
        return this._deWonAndParticipated;
    }

    set deWonAndParticipated(value: number) {
        this._deWonAndParticipated = value;
    }

    get finalsMatchesWonAndParticipated(): number {
        return this._finalsMatchesWonAndParticipated;
    }

    set finalsMatchesWonAndParticipated(value: number) {
        this._finalsMatchesWonAndParticipated = value;
    }

    get districtRank(): number {
        return this._districtRank;
    }

    set districtRank(value: number) {
        this._districtRank = value;
    }

    getAlliance(): number {
        if (!isNaN(this._allianceCaptain)) {
            return this._allianceCaptain;
        } else if (this._draftOrder >= 1 && this._draftOrder <= 8) {
            return this._draftOrder;
        } else if (this._draftOrder >= 9 && this._draftOrder <= 16) {
            return 16 - this._draftOrder + 1;
        } else {
            return NaN;
        }
    }

    getQualifyingPoints(): number {
        let firstInvERFArg = (Team.numberOfTeams - 2 * this.qualifyingRank + 2) / (Team.alpha * Team.numberOfTeams);
        let secondInvERFArg = (1.0 / Team.alpha);
        let firstInvERF = Team.invERF(firstInvERFArg);
        let secondInvERF = Team.invERF(secondInvERFArg);
        let newQP = firstInvERF * (10 / secondInvERF) + 12
        return 3 * Math.max(4, Math.ceil(newQP));
    }

    getCaptainPoints(): number {
        if (!isNaN(this._allianceCaptain)) {
            return 3 * (17 - this._allianceCaptain);
        } else {
            return 0;
        }
    }

    getDraftOrderPoints(): number {
        if (!isNaN(this._draftOrder)) {
            return 3 * (17 - this._draftOrder);
        } else {
            return 0;
        }
    }

    getRegularAwardPoints(): number {
        if (this._earnedRegularAward) {
            return 3 * 5;
        } else {
            return 0;
        }
    }

    getImpactPoints(): number {
        if (this._earnedImpactAward) {
            return 3 * 10;
        } else {
            return 0;
        }
    }

    getEIPoints(): number {
        if (this._earnedEIAward) {
            return 3 * 8;
        } else {
            return 0;
        }
    }

    getRookiePoints(): number {
        if (this._earnedRookieAward) {
            return 3 * 8;
        } else {
            return 0;
        }
    }

    getPlayOffPerformancePoints(): number {
        if (this._earned4th) {
            return 7 * (this._deWonAndParticipated / this._deWon);
        } else if (this._earned3rd) {
            return 13 * (this._deWonAndParticipated / this._deWon);
        } else if (this._earned2nd) {
            return 20 * (this._deWonAndParticipated / this._deWon);
        } else if (this._earned1st) {
            return 20 * (this._deWonAndParticipated / this._deWon) + Math.min(10, 5 * this._finalsMatchesWonAndParticipated);
        } else {
            return 0;
        }
    }


    getDistrictPoints(): number {
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

    static invERF(x: number) {
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