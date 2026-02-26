import { Test, TestingModule } from '@nestjs/testing';
import { SectionsService } from './sections.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  subject: {
    findFirst: jest.fn(),
  },
  professor: {
    findFirst: jest.fn(),
  },
  section: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sectionDay: {
    deleteMany: jest.fn(),
  },
};

const mockSection = {
  id: '1',
  startTime: new Date('1970-01-01T07:00:00Z'),
  endTime: new Date('1970-01-01T09:00:00Z'),
  subjectId: 'subject1',
  professorId: null,
  subject: { id: 'subject1', name: 'Matemáticas' },
  professor: null,
  sectionDays: [{ day: { name: 'monday' } }, { day: { name: 'wednesday' } }],
};

describe('SectionsService', () => {
  let service: SectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw NotFoundException if subject not found', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user1', {
          startTime: '07:00',
          endTime: '09:00',
          subjectId: 'subject1',
          dayIds: [1, 3],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if professor not found', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue({ id: 'subject1' });
      mockPrismaService.professor.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user1', {
          startTime: '07:00',
          endTime: '09:00',
          subjectId: 'subject1',
          professorId: 'professor1',
          dayIds: [1, 3],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a section and return formatted response', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue({ id: 'subject1' });
      mockPrismaService.section.create.mockResolvedValue(mockSection);

      const result = await service.create('user1', {
        startTime: '07:00',
        endTime: '09:00',
        subjectId: 'subject1',
        dayIds: [1, 3],
      });

      expect(result.startTime).toBe('07:00');
      expect(result.endTime).toBe('09:00');
      expect(result.days).toEqual(['monday', 'wednesday']);
    });
  });

  describe('findAll', () => {
    it('should return all sections formatted', async () => {
      mockPrismaService.section.findMany.mockResolvedValue([mockSection]);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(1);
      expect(result[0].days).toEqual(['monday', 'wednesday']);
    });
  });

  describe('findOne', () => {
    it('should return a section if found', async () => {
      mockPrismaService.section.findFirst.mockResolvedValue(mockSection);

      const result = await service.findOne('1', 'user1');

      expect(result.id).toBe('1');
      expect(result.startTime).toBe('07:00');
    });

    it('should throw NotFoundException if section not found', async () => {
      mockPrismaService.section.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a section', async () => {
      mockPrismaService.section.findFirst.mockResolvedValue(mockSection);
      mockPrismaService.section.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'user1');

      expect(mockPrismaService.section.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if section not found', async () => {
      mockPrismaService.section.findFirst.mockResolvedValue(null);

      await expect(service.remove('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
