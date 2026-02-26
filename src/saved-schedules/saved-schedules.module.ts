import { Module } from '@nestjs/common';
import { SavedSchedulesService } from './saved-schedules.service';
import { SavedSchedulesController } from './saved-schedules.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavedSchedulesController],
  providers: [SavedSchedulesService],
})
export class SavedSchedulesModule {}
