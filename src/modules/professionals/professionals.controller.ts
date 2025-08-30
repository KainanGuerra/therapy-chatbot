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
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto, RateProfessionalDto } from './dto/professional.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { ProfessionalType } from '../../common/enums';

@ApiTags('Professionals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new professional (Admin only)' })
  @ApiResponse({ status: 201, description: 'Professional created successfully' })
  create(@Body() createProfessionalDto: CreateProfessionalDto) {
    return this.professionalsService.create(createProfessionalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all professionals' })
  @ApiResponse({ status: 200, description: 'Professionals retrieved successfully' })
  @ApiQuery({ name: 'type', enum: ProfessionalType, required: false })
  @ApiQuery({ name: 'specialization', type: 'string', required: false })
  findAll(
    @Query('type') type?: ProfessionalType,
    @Query('specialization') specialization?: string,
  ) {
    return this.professionalsService.findAll(type, specialization);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI-powered professional recommendations for user' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  getRecommendations(@GetUser() user: User) {
    return this.professionalsService.getRecommendations(user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search professionals by name, specialization, or bio' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiQuery({ name: 'q', type: 'string', description: 'Search query' })
  search(@Query('q') query: string) {
    return this.professionalsService.searchProfessionals(query);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top-rated professionals' })
  @ApiResponse({ status: 200, description: 'Top-rated professionals retrieved successfully' })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  getTopRated(@Query('limit') limit?: number) {
    return this.professionalsService.getTopRatedProfessionals(limit);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get professionals by type' })
  @ApiResponse({ status: 200, description: 'Professionals by type retrieved successfully' })
  getProfessionalsByType(@Param('type') type: ProfessionalType) {
    return this.professionalsService.getProfessionalsByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a professional by ID' })
  @ApiResponse({ status: 200, description: 'Professional retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Professional not found' })
  findOne(@Param('id') id: string) {
    return this.professionalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a professional (Admin only)' })
  @ApiResponse({ status: 200, description: 'Professional updated successfully' })
  update(@Param('id') id: string, @Body() updateProfessionalDto: UpdateProfessionalDto) {
    return this.professionalsService.update(id, updateProfessionalDto);
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate a professional' })
  @ApiResponse({ status: 200, description: 'Professional rated successfully' })
  rateProfessional(
    @Param('id') id: string,
    @Body() rateProfessionalDto: RateProfessionalDto,
    @GetUser() user: User,
  ) {
    return this.professionalsService.rateProfessional(id, rateProfessionalDto.rating, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a professional (Admin only)' })
  @ApiResponse({ status: 200, description: 'Professional deleted successfully' })
  remove(@Param('id') id: string) {
    return this.professionalsService.remove(id);
  }
}