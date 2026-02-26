import { Test, TestingModule } from '@nestjs/testing';
import { ProfessorsService } from './professors.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  professor: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProfessorsService', () => {
  let service: ProfessorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessorsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProfessorsService>(ProfessorsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a professor', async () => {
      mockPrismaService.professor.create.mockResolvedValue({
        id: '1',
        fullName: 'Juan Pérez',
        userId: 'user1',
      });

      const result = await service.create('user1', { fullName: 'Juan Pérez' });

      expect(result).toEqual({
        id: '1',
        fullName: 'Juan Pérez',
        userId: 'user1',
      });
      expect(mockPrismaService.professor.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all professors for a user', async () => {
      mockPrismaService.professor.findMany.mockResolvedValue([
        { id: '1', fullName: 'Juan Pérez', userId: 'user1' },
        { id: '2', fullName: 'María García', userId: 'user1' },
      ]);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(2);
      expect(mockPrismaService.professor.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a professor if found', async () => {
      mockPrismaService.professor.findFirst.mockResolvedValue({
        id: '1',
        fullName: 'Juan Pérez',
        userId: 'user1',
      });

      const result = await service.findOne('1', 'user1');

      expect(result).toEqual({
        id: '1',
        fullName: 'Juan Pérez',
        userId: 'user1',
      });
    });

    it('should throw NotFoundException if professor not found', async () => {
      mockPrismaService.professor.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a professor', async () => {
      mockPrismaService.professor.findFirst.mockResolvedValue({
        id: '1',
        fullName: 'Juan Pérez',
        userId: 'user1',
      });
      mockPrismaService.professor.update.mockResolvedValue({
        id: '1',
        fullName: 'Juan Pablo Pérez',
        userId: 'user1',
      });

      const result = await service.update('1', 'user1', {
        fullName: 'Juan Pablo Pérez',
      });

      expect(result.fullName).toBe('Juan Pablo Pérez');
    });

    it('should throw NotFoundException if professor not found', async () => {
      mockPrismaService.professor.findFirst.mockResolvedValue(null);

      await expect(
        service.update('1', 'user1', { fullName: 'Juan Pablo Pérez' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a professor', async () => {
      mockPrismaService.professor.findFirst.mockResolvedValue({
        id: '1',
        fullName: 'Juan Pérez',
        userId: 'user1',
      });
      mockPrismaService.professor.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'user1');

      expect(mockPrismaService.professor.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if professor not found', async () => {
      mockPrismaService.professor.findFirst.mockResolvedValue(null);

      await expect(service.remove('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
