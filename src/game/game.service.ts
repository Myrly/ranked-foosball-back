import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
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
    if (game.firstTeam.some(playerId => playerId == player._id.toString()) || game.secondTeam.some(playerId => playerId == player._id.toString())) {
      throw new ConflictException('This player was already added to a team');
    }
    addPlayerGameDto.isFirstTeam
      ? game.firstTeam.push(player._id.toString())
      : game.secondTeam.push(player._id.toString());
    return game.save();
  }

  async endGame(id: string, finishGameDto: FinishGameDto) {
    let game = await this.gameModel.findOne({ id: id }).exec();
    let firstTeamFirstPlayer = await this.playerModel.findOne({ _id: game.firstTeam[0] }).exec();
    let firstTeamSecondPlayer = await this.playerModel.findOne({ _id: game.firstTeam[1] }).exec();
    let secondTeamFirstPlayer = await this.playerModel.findOne({ _id: game.secondTeam[0] }).exec();
    let secondTeamSecondPlayer = await this.playerModel.findOne({ _id: game.secondTeam[1] }).exec();

    let firstTeamAverageElo: number = (firstTeamFirstPlayer.elo + firstTeamSecondPlayer.elo) / 2;
    let secondTeamAverageElo: number = (secondTeamFirstPlayer.elo + secondTeamSecondPlayer.elo) / 2;

  }

  async calculateFirstTeamElo() {

  }

  calculatePlayerNewElo(teamAverageElo: number, didWin: boolean, opponentAverageElo: number, score: number) {
    const MAX_ELO_WITHOUT_SCORE: number = 32;
    const BASE_ELO: number = 1000;
    let expectedWin: number = 1 / (1 + Math.pow(10, (opponentAverageElo-teamAverageElo)/400));
    let proportionalScore: number = opponentAverageElo / BASE_ELO * score;
    return teamAverageElo + MAX_ELO_WITHOUT_SCORE * (+didWin - expectedWin) + proportionalScore;
  }

}
