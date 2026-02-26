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
import { CreateProfessorDto } from './dto/create-professor.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProfessorsService } from './professors.service';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Professors')
@ApiBearerAuth()
@Controller('professors')
@UseGuards(JwtAuthGuard)
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  @ApiOperation({ summary: 'Create a professor' })
  @Post()
  create(@Body() dto: CreateProfessorDto, @CurrentUser() user: User) {
    return this.professorsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Get all professors' })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.professorsService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Get a professor by ID' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.professorsService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Update a professor' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateProfessorDto,
    @CurrentUser() user: User,
  ) {
    return this.professorsService.update(id, user.id, dto);
  }

  @ApiOperation({ summary: 'Delete a professor' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.professorsService.remove(id, user.id);
  }
}
