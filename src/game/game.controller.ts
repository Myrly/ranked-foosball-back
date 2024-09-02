import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameService } from './game.service';
import { FinishGameDto } from './dto/finish-game.dto';
import {AddPlayerGameDto} from "./dto/add-player.dto";

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create() {
    return this.gameService.create();
  }

  @Patch(':id')
  addPlayer(@Param('id') id: string, @Body() addPlayerGameDto: AddPlayerGameDto) {
    return this.gameService.addPlayer(id, addPlayerGameDto);
  }

  @Delete(':id')
  endGame(@Param('id') id: string, @Body() finishGameDto: FinishGameDto) {
    return this.gameService.endGame(id, finishGameDto);
  }
}
