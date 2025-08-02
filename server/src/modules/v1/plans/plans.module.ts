import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { APP_GUARD } from '@nestjs/core';
import { PlanGuard } from './plan.guard';

@Module({
  providers: [
    PlansService,
    {
      provide: APP_GUARD,
      useClass: PlanGuard,
    },
  ],
  exports: [PlansService],
})
export class PlansModule {}
