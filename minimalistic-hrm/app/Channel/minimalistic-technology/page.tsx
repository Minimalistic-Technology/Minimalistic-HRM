"use client"
import React, { useState } from 'react';
import { 
  Hash, 
  Plus, 
  Search, 
  Filter, 
  Send, 
  MoreVertical,
  Users,
  Pin,
  Star
} from 'lucide-react';

interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  isPinned?: boolean;
  reactions?: { emoji: string; count: number }[];
}

interface ChannelInfo {
  name: string;
  description: string;
  memberCount: number;
  messageCount: number;
}

const MinimalisticTechnologyChannel: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const channelInfo: ChannelInfo = {
    name: 'Minimalistic-Technology',
    description: 'Discuss clean, efficient, and minimalist approaches to technology and development',
    memberCount: 12,
    messageCount: 3
  };

  const messages: Message[] = [
    {
      id: '1',
      user: 'Sarah Chen',
      avatar: 'SC',
      content: 'Just discovered this amazing minimal CSS framework that reduces bundle size by 80%. Perfect for our lightweight applications!',
      timestamp: '2 hours ago',
      isPinned: true,
      reactions: [
        { emoji: '🚀', count: 3 },
        { emoji: '💡', count: 2 }
      ]
    },
    {
      id: '2',
      user: 'Alex Kumar',
      avatar: 'AK',
      content: 'Has anyone tried implementing the "less is more" principle in API design? I\'m working on reducing our endpoint complexity.',
      timestamp: '4 hours ago',
      reactions: [
        { emoji: '🤔', count: 1 },
        { emoji: '👍', count: 4 }
      ]
    },
    {
      id: '3',
      user: 'Emma Rodriguez',
      avatar: 'ER',
      content: 'Sharing a great article on minimalist UI patterns that improve user experience while reducing cognitive load.',
      timestamp: '1 day ago',
      reactions: [
        { emoji: '📖', count: 2 },
        { emoji: '✨', count: 1 }
      ]
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to your backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Hash className="w-6 h-6 text-gray-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {channelInfo.name}
              </h1>
              <p className="text-sm text-gray-500">
                {channelInfo.memberCount} members • {channelInfo.messageCount} messages
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Pin className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Channel Description */}
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">{channelInfo.description}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-3 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="group">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {message.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {message.user}
                  </span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                  {message.isPinned && (
                    <Pin className="w-3 h-3 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                  {message.content}
                </p>
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="mt-2 flex items-center space-x-1">
                    {message.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-xs"
                      >
                        <span className="mr-1">{reaction.emoji}</span>
                        <span className="text-gray-600">{reaction.count}</span>
                      </button>
                    ))}
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                      <Plus className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Message Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message #${channelInfo.name}`}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex items-center space-x-4">
          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            + Add file
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            @mention
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            #link channel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalisticTechnologyChannel;