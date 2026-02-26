import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SubjectsService } from './subjects.service';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Subjects')
@ApiBearerAuth()
@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Create a subject' })
  @Post()
  create(@Body() dto: CreateSubjectDto, @CurrentUser() user: User) {
    return this.subjectsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Get all subjects' })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.subjectsService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Get a subject by ID' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.subjectsService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Update a subject' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateSubjectDto,
    @CurrentUser() user: User,
  ) {
    return this.subjectsService.update(id, user.id, dto);
  }

  @ApiOperation({ summary: 'Delete a subject' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.subjectsService.remove(id, user.id);
  }
}
