import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { SavedSchedulesService } from './saved-schedules.service';
import { CreateSavedScheduleDto } from './dto/create-saved-schedule.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UpdateSavedScheduleDto } from './dto/update-saved-schedule.dto';

@Controller('saved-schedules')
@UseGuards(JwtAuthGuard)
export class SavedSchedulesController {
  constructor(private readonly savedSchedulesService: SavedSchedulesService) {}

  @Post()
  create(@Body() dto: CreateSavedScheduleDto, @CurrentUser() user: User) {
    return this.savedSchedulesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.savedSchedulesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.savedSchedulesService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSavedScheduleDto,
    @CurrentUser() user: User,
  ) {
    return this.savedSchedulesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.savedSchedulesService.remove(id, user.id);
  }
}
