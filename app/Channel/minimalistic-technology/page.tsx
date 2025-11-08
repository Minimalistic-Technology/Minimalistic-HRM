"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Hash, 
  Plus, 
  Search, 
  Send, 
  MoreVertical,
  Users,
  Pin,
  Smile,
  Paperclip,
  X,
  Reply,
  Edit3,
  Trash2,
  Copy,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  isPinned?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  replies?: number;
  isEdited?: boolean;
}

interface ChannelInfo {
  name: string;
  description: string;
  memberCount: number;
  messageCount: number;
}

const MinimalisticTechnologyChannel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: 'Harsh Rathani',
      avatar: 'SC',
      content: 'Just discovered this amazing minimal CSS framework that reduces bundle size by 80%. Perfect for our lightweight applications!',
      timestamp: '2 hours ago',
      isPinned: true,
      reactions: [
        { emoji: '🚀', count: 3, users: ['Alex Kumar', 'Emma Rodriguez', 'John Doe'] },
        { emoji: '💡', count: 2, users: ['Mike Johnson', 'Lisa Wang'] }
      ],
      replies: 5
    },
    {
      id: '2',
      user: 'Parth Doshi',
      avatar: 'AK',
      content: 'Has anyone tried implementing the "less is more" principle in API design? I\'m working on reducing our endpoint complexity.',
      timestamp: '4 hours ago',
      reactions: [
        { emoji: '🤔', count: 1, users: ['Sarah Chen'] },
        { emoji: '👍', count: 4, users: ['Emma Rodriguez', 'John Doe', 'Mike Johnson', 'Lisa Wang'] }
      ],
      replies: 3
    },
    {
      id: '3',
      user: 'Sneha Chavan',
      avatar: 'ER',
      content: 'Sharing a great article on minimalist UI patterns that improve user experience while reducing cognitive load.',
      timestamp: '1 day ago',
      reactions: [
        { emoji: '📖', count: 2, users: ['Sarah Chen', 'Alex Kumar'] },
        { emoji: '✨', count: 1, users: ['John Doe'] }
      ],
      replies: 2
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<Message[]>(messages);
  const [showMembersList, setShowMembersList] = useState(false);
  const [currentUser] = useState('You');
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelInfo: ChannelInfo = {
    name: 'Minimalistic-Technology',
    description: 'Discuss clean, efficient, and minimalist approaches to technology and development',
    memberCount: 12,
    messageCount: messages.length
  };

  const commonEmojis = ['👍', '❤️', '😂', '🚀', '💡', '🤔', '✨', '📖', '🎉', '👏'];
  
  const members = [
    'Sneha Chavan', 'Parth Doshi', 'Harsh Rathani', 'Chirag', 
    'Devansh', 'Manan', 'Azim', 'Jay',
    'Vyom', 'Meet', 'Shubham', 'You'
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  // Filter messages based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [searchQuery, messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: generateId(),
        user: currentUser,
        avatar: 'YO',
        content: newMessage,
        timestamp: 'now',
        reactions: [],
        replies: 0
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const existingReaction = message.reactions?.find(r => r.emoji === emoji);
        const userAlreadyReacted = existingReaction?.users.includes(currentUser);
        
        if (existingReaction) {
          if (userAlreadyReacted) {
            // Remove user's reaction
            return {
              ...message,
              reactions: message.reactions?.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser) }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Add user's reaction
            return {
              ...message,
              reactions: message.reactions?.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, users: [...r.users, currentUser] }
                  : r
              )
            };
          }
        } else {
          // Add new reaction
          return {
            ...message,
            reactions: [...(message.reactions || []), { emoji, count: 1, users: [currentUser] }]
          };
        }
      }
      return message;
    }));
    setShowEmojiPicker(null);
  };

  const handlePinMessage = (messageId: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId 
        ? { ...message, isPinned: !message.isPinned }
        : message
    ));
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.user === currentUser) {
      setEditingMessage(messageId);
      setEditContent(message.content);
    }
  };

  const handleSaveEdit = (messageId: string) => {
    if (editContent.trim()) {
      setMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, content: editContent, isEdited: true }
          : message
      ));
    }
    setEditingMessage(null);
    setEditContent('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(prev => prev.filter(message => message.id !== messageId));
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const formatTimestamp = (timestamp: string) => {
    if (timestamp === 'now') return 'now';
    return timestamp;
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
                {channelInfo.memberCount} members • {filteredMessages.length} messages
                {searchQuery && ` (filtered)`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                const pinnedMessages = messages.filter(m => m.isPinned);
                alert(`${pinnedMessages.length} pinned messages`);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Pin className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setShowMembersList(!showMembersList)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
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

        {/* Members List */}
        {showMembersList && (
          <div className="mt-3 p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Members ({members.length})</h3>
            <div className="grid grid-cols-3 gap-2">
              {members.map(member => (
                <div key={member} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                    {member.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <span className="text-xs text-gray-700">{member}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            {searchQuery ? `No messages found for "${searchQuery}"` : 'No messages yet'}
          </div>
        ) : (
          filteredMessages.map((message) => (
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
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                    {message.isPinned && (
                      <Pin className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  {editingMessage === message.id ? (
                    <div className="mt-1">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(message.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMessage(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                      {message.content}
                    </p>
                  )}
                  
                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="mt-2 flex items-center flex-wrap gap-1">
                      {message.reactions.map((reaction, index) => (
                        <button
                          key={index}
                          onClick={() => handleReaction(message.id, reaction.emoji)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs transition-colors ${
                            reaction.users.includes(currentUser)
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          title={`${reaction.users.join(', ')} reacted with ${reaction.emoji}`}
                        >
                          <span className="mr-1">{reaction.emoji}</span>
                          <span className="text-gray-600">{reaction.count}</span>
                        </button>
                      ))}
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Plus className="w-3 h-3 text-gray-400" />
                        </button>
                        
                        {/* Emoji Picker */}
                        {showEmojiPicker === message.id && (
                          <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                            <div className="grid grid-cols-5 gap-1">
                              {commonEmojis.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(message.id, emoji)}
                                  className="p-2 hover:bg-gray-100 rounded text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Reply count */}
                  {message.replies && message.replies > 0 && (
                    <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{message.replies} replies</span>
                    </button>
                  )}
                </div>
                
                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleReaction(message.id, '👍')}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Add reaction"
                    >
                      <Smile className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => alert('Reply functionality would open a thread')}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Reply in thread"
                    >
                      <Reply className="w-4 h-4 text-gray-400" />
                    </button>
                    {message.user === currentUser && (
                      <>
                        <button
                          onClick={() => handleEditMessage(message.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit message"
                        >
                          <Edit3 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handlePinMessage(message.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title={message.isPinned ? "Unpin message" : "Pin message"}
                    >
                      <Pin className={`w-4 h-4 ${message.isPinned ? 'text-yellow-500' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => handleCopyMessage(message.content)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy message"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
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
          
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          
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