import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./schemas/player.schema";
import {Model} from "mongoose";
import {PlayerEntity} from "./entities/player.entity";

@Injectable()
export class PlayerService {

  constructor(@InjectModel(Player.name) private playerModel: Model<Player>) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const takenIdOrName = await this.playerModel.findOne({
      $or: [{ id: createPlayerDto.id }, { name: createPlayerDto.name }],
    });
    if (takenIdOrName) {
      throw new ConflictException('A player with this ID or username already exists.');
    }
    const DEFAULT_ELO: number = 1000;
    const DEFAULT_WINS_AMOUNT: number = 0;
    const DEFAULT_GAMES_AMOUNT: number = 0;
    let player: PlayerEntity = new PlayerEntity(
      createPlayerDto.id,
      createPlayerDto.name,
      DEFAULT_ELO,
      DEFAULT_WINS_AMOUNT,
      DEFAULT_GAMES_AMOUNT,
    );
    const createdPlayer = new this.playerModel(player);
    return createdPlayer.save();
  }

  async findAll(): Promise<Player[]> {
    return this.playerModel.find().select('-id').exec();
  }

  async findOne(id: string) {
    return this.playerModel.findOne({ id: id }).select('-id').exec();
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto) {
    const takenName = await this.playerModel.findOne({ name: updatePlayerDto.name });
    if (takenName) {
      throw new ConflictException('A player with this ID or username already exists.');
    }
    let existingPlayer = await this.playerModel.findOne({ id: id }).exec();
    if (!existingPlayer) {
      throw new NotFoundException('A player with this ID doesn\'t exists.');
    }
    existingPlayer.name = updatePlayerDto.name;
    return existingPlayer.save();
  }

  async remove(id: string) {
    return this.playerModel.deleteOne({ id: id });
  }
}
