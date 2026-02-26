import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ProfessorsModule } from './professors/professors.module';
import { SectionsModule } from './sections/sections.module';
import { RulesModule } from './rules/rules.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SavedSchedulesModule } from './saved-schedules/saved-schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubjectsModule,
    ProfessorsModule,
    SectionsModule,
    RulesModule,
    SchedulingModule,
    SavedSchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
