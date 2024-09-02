export class AddPlayerGameDto {

  constructor(
    public gameId: number,
    public isFirstTeam: boolean,
    public playerId: string,
  ) {
  }

}
