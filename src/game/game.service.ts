import {ConflictException, GoneException, Injectable, NotFoundException} from '@nestjs/common';
import { FinishGameDto } from './dto/finish-game.dto';
import {AddPlayerGameDto} from "./dto/add-player.dto";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Game} from "./schemas/game.schema";
import {CreateGameDto} from "./dto/create-game.dto";
import {Player} from "../player/schemas/player.schema";
import {PlayerEntity} from "../player/entities/player.entity";

@Injectable()
export class GameService {

  constructor(@InjectModel(Game.name) private gameModel: Model<Game>, @InjectModel(Player.name) private playerModel: Model<Player>) {
  }
  create() {
    let game: CreateGameDto = new CreateGameDto([], []);
    const createdGame = new this.gameModel(game);
    return createdGame.save();
  }

  async addPlayer(id: string, addPlayerGameDto: AddPlayerGameDto) {
    let game = await this.gameModel.findOne({ id: id }).exec();
    if (!game) {
      throw new NotFoundException('A game with this ID doesn\'t exist.')
    }
    let player = await this.playerModel.findOne({ id: addPlayerGameDto.playerId }).exec();
    if (!player) {
      throw new NotFoundException('A player with this ID doesn\'t exist.')
    }
    if (game.firstTeam.some(playerId => playerId == player._id.toString()) || game.secondTeam.some(playerId => playerId == player._id.toString())) {
      throw new ConflictException('This player was already added to a team');
    }
    addPlayerGameDto.isFirstTeam
      ? game.firstTeam.push(player._id.toString())
      : game.secondTeam.push(player._id.toString());
    return game.save();
  }

  private updatePlayerStats(player: any, teamScore: number, opponentAverageElo: number, teamAverageElo: number) {
    player.elo = this.calculatePlayerNewElo(player.elo, teamAverageElo, teamScore == 10, opponentAverageElo, teamScore);
    player.games++;
    player.wins += teamScore == 10 ? 1 : 0;
    player.wlr = (player.games - player.wins) === 0 ? player.wins : player.wins / (player.games - player.wins);
    return player.save();
  }

  async endGame(id: string, finishGameDto: FinishGameDto) {

    if (finishGameDto.isCancelled) {
      return this.gameModel.deleteOne({ id: id }).exec();
    }

    const game = await this.gameModel.findOne({ id: id }).exec();
    if (!game) {
      throw new NotFoundException('This game is already finished or has never existed.');
    }

    const fetchPlayer = async (playerId: string) => {
      return this.playerModel.findOne({ _id: playerId }).exec();
    };

    const [
      firstTeamFirstPlayer,
      firstTeamSecondPlayer,
      secondTeamFirstPlayer,
      secondTeamSecondPlayer
    ] = await Promise.all([
      fetchPlayer(game.firstTeam[0]),
      fetchPlayer(game.firstTeam[1]),
      fetchPlayer(game.secondTeam[0]),
      fetchPlayer(game.secondTeam[1]),
    ]);

    const firstTeamAverageElo = (firstTeamFirstPlayer.elo + firstTeamSecondPlayer.elo) / 2;
    const secondTeamAverageElo = (secondTeamFirstPlayer.elo + secondTeamSecondPlayer.elo) / 2;

    await Promise.all([
      this.updatePlayerStats(firstTeamFirstPlayer, finishGameDto.firstTeamScore, secondTeamAverageElo, firstTeamAverageElo),
      this.updatePlayerStats(firstTeamSecondPlayer, finishGameDto.firstTeamScore, secondTeamAverageElo, firstTeamAverageElo),
      this.updatePlayerStats(secondTeamFirstPlayer, finishGameDto.secondTeamScore, firstTeamAverageElo, secondTeamAverageElo),
      this.updatePlayerStats(secondTeamSecondPlayer, finishGameDto.secondTeamScore, firstTeamAverageElo, secondTeamAverageElo),
    ]);

    return this.gameModel.deleteOne({ id: id }).exec();
  }

  calculatePlayerNewElo(playerElo: number, teamAverageElo: number, didWin: boolean, opponentAverageElo: number, score: number) {
    const MAX_ELO_WITHOUT_SCORE: number = 32;
    const BASE_ELO: number = 1000;
    let expectedWin: number = 1 / (1 + Math.pow(10, (opponentAverageElo-teamAverageElo)/400));
    let proportionalScore: number = opponentAverageElo / BASE_ELO * score;
    return playerElo + MAX_ELO_WITHOUT_SCORE * (+didWin - expectedWin) + proportionalScore;
  }

}
