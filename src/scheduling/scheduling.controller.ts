import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Scheduling')
@ApiBearerAuth()
@Controller('scheduling')
@UseGuards(JwtAuthGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @ApiOperation({ summary: 'Generate optimized schedules based on rules' })
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generate(@Body() dto: GenerateScheduleDto, @CurrentUser() user: User) {
    return this.schedulingService.generate(user.id, dto);
  }
}
