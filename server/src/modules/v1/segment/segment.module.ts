import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SegmentService } from './segment.service';

import Segment = require('analytics-node');

@Module({
  providers: [
    {
      provide: Segment,
      useFactory: (config: ConfigService) => {
        return new Segment(config.get('SEGMENT_KEY') ?? 'asd');
      },
      inject: [ConfigService],
    },
    SegmentService,
  ],
  exports: [Segment],
})
export class SegmentModule {}
