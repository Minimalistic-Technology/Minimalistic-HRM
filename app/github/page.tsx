"use client"
import React, { useState } from 'react';
import { 
  FolderIcon, 
  StarIcon, 
  GitBranchIcon, 
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  ExternalLinkIcon,
  SearchIcon
} from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  isPrivate: boolean;
}

const GitHubRepoManager: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: '1',
      name: 'awesome-project',
      url: 'https://github.com/user/awesome-project',
      description: 'A really awesome project that does amazing things',
      language: 'TypeScript',
      stars: 247,
      forks: 45,
      updatedAt: '2024-09-25',
      isPrivate: false
    },
    {
      id: '2',
      name: 'secret-sauce',
      url: 'https://github.com/user/secret-sauce',
      description: 'Private repository for internal tools',
      language: 'Python',
      stars: 12,
      forks: 3,
      updatedAt: '2024-09-24',
      isPrivate: true
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRepo, setNewRepo] = useState({
    name: '',
    url: '',
    description: '',
    language: '',
    isPrivate: false
  });

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRepository = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRepo.name || !newRepo.url) return;

    const repository: Repository = {
      id: Date.now().toString(),
      name: newRepo.name,
      url: newRepo.url,
      description: newRepo.description || 'No description provided',
      language: newRepo.language || 'Unknown',
      stars: Math.floor(Math.random() * 100),
      forks: Math.floor(Math.random() * 20),
      updatedAt: new Date().toISOString().split('T')[0],
      isPrivate: newRepo.isPrivate
    };

    setRepositories(prev => [repository, ...prev]);
    setNewRepo({ name: '', url: '', description: '', language: '', isPrivate: false });
    setShowAddForm(false);
  };

  const handleDeleteRepository = (id: string) => {
    setRepositories(prev => prev.filter(repo => repo.id !== id));
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'TypeScript': 'bg-blue-500',
      'JavaScript': 'bg-yellow-400',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'C++': 'bg-purple-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-500',
    };
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Repositories</h1>
            <p className="text-gray-600 mt-2">Manage your GitHub repository links</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Repository
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Add Repository Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold mb-4">Add New Repository</h2>
              <form onSubmit={handleAddRepository}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Repository Name *
                    </label>
                    <input
                      type="text"
                      value={newRepo.name}
                      onChange={(e) => setNewRepo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="my-awesome-repo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Repository URL *
                    </label>
                    <input
                      type="url"
                      value={newRepo.url}
                      onChange={(e) => setNewRepo(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username/repo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newRepo.description}
                      onChange={(e) => setNewRepo(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                      placeholder="Brief description of your repository"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Language
                    </label>
                    <select
                      value={newRepo.language}
                      onChange={(e) => setNewRepo(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select language</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                      <option value="Go">Go</option>
                      <option value="Rust">Rust</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={newRepo.isPrivate}
                      onChange={(e) => setNewRepo(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    <label htmlFor="isPrivate" className="text-sm text-gray-700">
                      Private repository
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Repository
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Repository Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepos.map((repo) => (
            <div key={repo.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 truncate">{repo.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                    title={`Open ${repo.name} repository in new tab`}
                    aria-label={`Open ${repo.name} repository in new tab`}
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteRepository(repo.id)}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {repo.isPrivate && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-2">
                  Private
                </span>
              )}

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {repo.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                    <span>{repo.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranchIcon className="w-4 h-4" />
                    <span>{repo.forks}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                <CalendarIcon className="w-3 h-3" />
                <span>Updated {repo.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first repository'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Add Repository
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoManager;