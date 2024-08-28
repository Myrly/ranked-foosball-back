import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerModule } from './player/player.module';
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [
    PlayerModule,
    MongooseModule.forRoot('<uri>', {
      dbName: 'foosball',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
