import { CountsModule } from '@modules/app/counts/counts.module';
import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { LocationRepositoryProvider } from './infra/locations.repo';

@Module({
  imports: [CountsModule],
  providers: [LocationsService, LocationRepositoryProvider],
  exports: [LocationsService],
  controllers: [LocationsController],
})
export class LocationsModule {}
