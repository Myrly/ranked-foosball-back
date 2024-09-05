import {ConflictException, GoneException, Injectable, NotAcceptableException, NotFoundException} from '@nestjs/common';
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

  get(id: string) {
    return this.gameModel.findOne({ id: id }).exec();
  }

  create() {
    let game: CreateGameDto = new CreateGameDto([], []);
    const createdGame = new this.gameModel(game);
    return createdGame.save();
  }

  async addPlayer(id: string, addPlayerGameDto: AddPlayerGameDto) {
    let game = await this.gameModel.findOne({ id: id }).exec();
    if (!game) {
      throw new GoneException('A game with this ID doesn\'t exist.')
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
    await game.save();
    return player._id;
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
    } else {

      const game = await this.gameModel.findOne({id: id}).exec();
      if (!game) {
        throw new NotFoundException('This game is already finished or has never existed.');
      }
      if (game.firstTeam.length === 0 || game.secondTeam.length === 0) {
        throw new NotAcceptableException('Both teams must have at least one player.');
      }

      const fetchPlayer = async (playerId: string) => {
        const player = await this.playerModel.findOne({_id: playerId}).exec();
        if (!player) {
          throw new NotFoundException(`Player with id ${playerId} not found.`);
        }
        return player;
      };

      const firstTeamPlayers = await Promise.all(game.firstTeam.map(fetchPlayer));
      const secondTeamPlayers = await Promise.all(game.secondTeam.map(fetchPlayer));

      const firstTeamAverageElo = firstTeamPlayers.reduce((sum, player) => sum + player.elo, 0) / firstTeamPlayers.length;
      const secondTeamAverageElo = secondTeamPlayers.reduce((sum, player) => sum + player.elo, 0) / secondTeamPlayers.length;

      await Promise.all([
        ...firstTeamPlayers.map(player => this.updatePlayerStats(player, finishGameDto.firstTeamScore, secondTeamAverageElo, firstTeamAverageElo)),
        ...secondTeamPlayers.map(player => this.updatePlayerStats(player, finishGameDto.secondTeamScore, firstTeamAverageElo, secondTeamAverageElo)),
      ]);

      return this.gameModel.deleteOne({id: id}).exec();
    }
  }

  calculatePlayerNewElo(playerElo: number, teamAverageElo: number, didWin: boolean, opponentAverageElo: number, score: number) {
    const MAX_ELO_WITHOUT_SCORE: number = 32;
    const BASE_ELO: number = 1000;
    let expectedWin: number = 1 / (1 + Math.pow(10, (opponentAverageElo-teamAverageElo)/400));
    let proportionalScore: number = opponentAverageElo / BASE_ELO * score;
    return playerElo + MAX_ELO_WITHOUT_SCORE * (+didWin - expectedWin) + proportionalScore;
  }

}
