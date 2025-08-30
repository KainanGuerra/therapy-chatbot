import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto, UpdateHabitDto, CompleteHabitDto } from './dto/habit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { HabitCategory } from '../../common/enums';

@ApiTags('Habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new habit for the user' })
  @ApiResponse({ status: 201, description: 'Habit created successfully' })
  create(@GetUser() user: User, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.createHabit(user.id, createHabitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user habits' })
  @ApiResponse({ status: 200, description: 'Habits retrieved successfully' })
  @ApiQuery({ name: 'category', enum: HabitCategory, required: false })
  findAll(@GetUser() user: User, @Query('category') category?: HabitCategory) {
    return this.habitsService.getUserHabits(user.id, category);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get personalized habit suggestions based on mood and context' })
  @ApiResponse({ status: 200, description: 'Habit suggestions retrieved successfully' })
  getPersonalizedSuggestions(@GetUser() user: User) {
    return this.habitsService.getPersonalizedSuggestions(user.id);
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get general recommended habits' })
  @ApiResponse({ status: 200, description: 'Recommended habits retrieved successfully' })
  getRecommendedHabits() {
    return this.habitsService.getRecommendedHabits();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user habit statistics' })
  @ApiResponse({ status: 200, description: 'Habit statistics retrieved successfully' })
  getHabitStats(@GetUser() user: User) {
    return this.habitsService.getHabitStats(user.id);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get habits by category' })
  @ApiResponse({ status: 200, description: 'Habits by category retrieved successfully' })
  getHabitsByCategory(@GetUser() user: User, @Param('category') category: HabitCategory) {
    return this.habitsService.getHabitsByCategory(user.id, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific habit' })
  @ApiResponse({ status: 200, description: 'Habit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  findOne(@GetUser() user: User, @Param('id') id: string) {
    return this.habitsService.getHabitById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit' })
  @ApiResponse({ status: 200, description: 'Habit updated successfully' })
  update(@GetUser() user: User, @Param('id') id: string, @Body() updateHabitDto: UpdateHabitDto) {
    return this.habitsService.updateHabit(id, user.id, updateHabitDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark habit as completed or incomplete' })
  @ApiResponse({ status: 200, description: 'Habit completion status updated successfully' })
  completeHabit(@GetUser() user: User, @Param('id') id: string, @Body() completeHabitDto: CompleteHabitDto) {
    return this.habitsService.completeHabit(id, user.id, completeHabitDto);
  }

  @Patch(':id/reset-streak')
  @ApiOperation({ summary: 'Reset habit streak' })
  @ApiResponse({ status: 200, description: 'Habit streak reset successfully' })
  resetStreak(@GetUser() user: User, @Param('id') id: string) {
    return this.habitsService.resetHabitStreak(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a habit' })
  @ApiResponse({ status: 200, description: 'Habit deleted successfully' })
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.habitsService.deleteHabit(id, user.id);
  }
}