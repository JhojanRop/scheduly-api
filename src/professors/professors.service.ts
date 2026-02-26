import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfessorDto } from './dto/create-professor.dto';

@Injectable()
export class ProfessorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProfessorDto) {
    return this.prisma.professor.create({
      data: {
        fullName: dto.fullName,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.professor.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    const professor = await this.prisma.professor.findFirst({
      where: { id, userId },
    });

    if (!professor) throw new NotFoundException('Professor not found');
    return professor;
  }

  async update(id: string, userId: string, dto: CreateProfessorDto) {
    await this.findOne(id, userId);

    return this.prisma.professor.update({
      where: { id },
      data: { fullName: dto.fullName },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.professor.delete({
      where: { id },
    });
  }
}
