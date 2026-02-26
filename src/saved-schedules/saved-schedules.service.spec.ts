import { Test, TestingModule } from '@nestjs/testing';
import { SavedSchedulesService } from './saved-schedules.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockSchedule = {
  id: '1',
  name: 'Mi horario',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  userId: 'user1',
  schedulesSections: [
    {
      scheduleId: '1',
      sectionId: 'section1',
      section: {
        id: 'section1',
        startTime: new Date('1970-01-01T07:00:00Z'),
        endTime: new Date('1970-01-01T09:00:00Z'),
        subjectId: 'subject1',
        professorId: null,
        subject: { id: 'subject1', name: 'Matemáticas', userId: 'user1' },
        professor: null,
        sectionDays: [{ day: { name: 'monday' } }],
      },
    },
  ],
};

const mockPrismaService = {
  savedSchedule: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SavedSchedulesService', () => {
  let service: SavedSchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSchedulesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SavedSchedulesService>(SavedSchedulesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a saved schedule and return formatted response', async () => {
      mockPrismaService.savedSchedule.create.mockResolvedValue(mockSchedule);

      const result = await service.create('user1', {
        name: 'Mi horario',
        sectionIds: ['section1'],
      });

      expect(result.id).toBe('1');
      expect(result.name).toBe('Mi horario');
      expect(result.sections[0].startTime).toBe('07:00');
      expect(result.sections[0].days).toEqual(['monday']);
    });
  });

  describe('findAll', () => {
    it('should return all saved schedules formatted', async () => {
      mockPrismaService.savedSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Mi horario');
    });
  });

  describe('findOne', () => {
    it('should return a saved schedule if found', async () => {
      mockPrismaService.savedSchedule.findFirst.mockResolvedValue(mockSchedule);

      const result = await service.findOne('1', 'user1');

      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.savedSchedule.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update the name of a saved schedule', async () => {
      mockPrismaService.savedSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.savedSchedule.update.mockResolvedValue({
        ...mockSchedule,
        name: 'Nuevo nombre',
      });

      const result = await service.update('1', 'user1', {
        name: 'Nuevo nombre',
      });

      expect(result.name).toBe('Nuevo nombre');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.savedSchedule.findFirst.mockResolvedValue(null);

      await expect(
        service.update('1', 'user1', { name: 'Nuevo nombre' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a saved schedule', async () => {
      mockPrismaService.savedSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.savedSchedule.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'user1');

      expect(mockPrismaService.savedSchedule.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.savedSchedule.findFirst.mockResolvedValue(null);

      await expect(service.remove('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
