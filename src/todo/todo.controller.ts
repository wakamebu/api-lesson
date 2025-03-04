import { Controller , Body , Delete,Get,HttpCode,HttpStatus,Param,ParseIntPipe,Patch,Post,UseGuards,Req, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TodoService } from './todo.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

@Controller('todo')
@UseGuards(AuthGuard('jwt'))
export class TodoController {
    constructor(private readonly todoService: TodoService) {}

    @Get()
    getTasks(@Req() req: Request): Promise<Task[]> {
        if (!req.user) {
            throw new Error('User not found');
        }
        return this.todoService.getTasks(req.user.id);
    }

    @Get(':id')
    getTaskById(
        @Req() req: Request,
        @Param('id', ParseIntPipe) taskId: number,
    ): Promise<Task | null> {
        if (!req.user) {
            throw new Error('User not found');
        }
        return this.todoService.getTaskById(req.user.id, taskId);
    }

    @Post()
    createTask(
        @Req() req: Request,
        @Body() dto: CreateTaskDto,
    ): Promise<Task> {
        if (!req.user) {
            throw new Error('User not found');
        }
        return this.todoService.createTask(req.user.id, dto);
    }

    @Patch(':id')
    updateTaskById(
        @Req() req: Request,
        @Param('id', ParseIntPipe) taskId: number,
        @Body() dto: UpdateTaskDto,
    ): Promise<Task> {
        if (!req.user) {
            throw new Error('User not found');
        }
        return this.todoService.updateTask(req.user.id, taskId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteTaskById(
        @Req() req: Request,
        @Param('id', ParseIntPipe) taskId: number,
    ): Promise<void> {
        if (!req.user) {
            throw new Error('User not found');
        }
        return this.todoService.deleteTaskById(req.user.id, taskId);
    }
}
