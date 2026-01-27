import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    try {
      const task = new this.taskModel({
        title: createTaskDto.title,
        description: createTaskDto.description,
        completed: createTaskDto.completed ?? false,
      });

      return await task.save();
    } catch (error) {
      throw new BadRequestException('Failed to create task');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    completed?: boolean,
  ) {
    const filter: any = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (completed !== undefined) {
      filter.completed = completed;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.taskModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task id');
    }

    const task = await this.taskModel.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task id');
    }

    const task = await this.taskModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async markCompleted(id: string) {
    return this.update(id, { completed: true });
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task id');
    }

    const task = await this.taskModel.findByIdAndDelete(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return { message: 'Task deleted successfully' };
  }
}
