import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateSessionDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  async createSession(@GetUser() user: User, @Body() createSessionDto: CreateSessionDto) {
    return this.chatService.createSession(user.id, createSessionDto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get user chat sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getUserSessions(@GetUser() user: User) {
    return this.chatService.getUserSessions(user.id);
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Get messages from a chat session' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getSessionMessages(@GetUser() user: User, @Param('sessionId') sessionId: string) {
    return this.chatService.getSessionMessages(sessionId, user.id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message to the chatbot' })
  @ApiResponse({ status: 201, description: 'Message sent and response generated' })
  async sendMessage(@GetUser() user: User, @Body() sendMessageDto: SendMessageDto) {
    return this.chatService.sendMessage(user.id, sendMessageDto);
  }

  @Get('mood-history')
  @ApiOperation({ summary: 'Get user mood history' })
  @ApiResponse({ status: 200, description: 'Mood history retrieved successfully' })
  async getMoodHistory(@GetUser() user: User, @Query('days', new ParseIntPipe({ optional: true })) days?: number) {
    return this.chatService.getMoodHistory(user.id, days);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  async deleteSession(@GetUser() user: User, @Param('sessionId') sessionId: string) {
    await this.chatService.deleteSession(sessionId, user.id);
    return { message: 'Session deleted successfully' };
  }
}
