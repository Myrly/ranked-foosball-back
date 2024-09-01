import {PlayerEntity} from "../../player/entities/player.entity";

export class GameEntity {

    constructor(
        public id: number,
        public teams: TeamEntity[]
    ) {
    }

}

export class TeamEntity {

    constructor(
        public id: number,
        public players: PlayerEntity[],

    ) {
    }

}
