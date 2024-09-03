export class CreateGameDto {

  constructor(
    public firstTeam: string[],
    public secondTeam: string[],
  ) {
  }

}
