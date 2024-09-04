export class FinishGameDto {

    constructor(
        public id: string,
        public firstTeamScore: number,
        public secondTeamScore: number,
        public isCancelled: boolean,
    ) {
    }

}
