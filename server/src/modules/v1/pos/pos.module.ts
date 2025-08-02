import { Module } from '@nestjs/common';
import { SquareModule } from './square/square.module';
import { PosController } from './pos.controller';
import { CloverModule } from './clover/clover.module';

@Module({
  imports: [SquareModule, CloverModule],
  providers: [],
  exports: [SquareModule, CloverModule],
  controllers: [PosController],
})
export class PosModule {}
