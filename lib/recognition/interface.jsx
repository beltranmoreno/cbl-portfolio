import React, { useState, useEffect } from 'react';
import { Search, Users, Tag, CheckCircle, ArrowRight, Loader } from 'lucide-react';

const FaceTaggingInterface = () => {
  const [untaggedFaces, setUntaggedFaces] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [personName, setPersonName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [taggedCount, setTaggedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('tag'); // 'tag' or 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Mock data - replace with actual API calls
  const mockFaces = [
    {
      face_id: '1',
      filename: 'negative_0042.jpg',
      s3_url: 'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=Photo+1',
      bounding_box: { Left: 0.3, Top: 0.2, Width: 0.2, Height: 0.3 },
      age_range: { Low: 30, High: 40 },
      gender: { Value: 'Male', Confidence: 95 }
    },
    {
      face_id: '2',
      filename: 'negative_0098.jpg',
      s3_url: 'https://via.placeholder.com/800x600/6B7280/FFFFFF?text=Photo+2',
      bounding_box: { Left: 0.4, Top: 0.15, Width: 0.25, Height: 0.35 },
      age_range: { Low: 25, High: 35 },
      gender: { Value: 'Female', Confidence: 92 }
    }
  ];

  const mockPeople = ['John Smith', 'Jane Doe', 'Robert Johnson', 'Mary Williams'];

  useEffect(() => {
    // Simulate loading untagged faces
    setUntaggedFaces(mockFaces);
  }, []);

  const currentFace = untaggedFaces[currentIndex];

  const handleTag = async (name) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTaggedCount(taggedCount + 1);
    setPersonName('');
    
    // Move to next face
    if (currentIndex < untaggedFaces.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setLoading(false);
  };

  const handleTagSimilar = async (name) => {
    setLoading(true);
    // Simulate finding and tagging similar faces
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTaggedCount(taggedCount + 5); // Simulating 5 similar faces tagged
    setLoading(false);
    alert(`Tagged ${name} in 5 similar photos!`);
  };

  const handleSearch = async () => {
    setLoading(true);
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 500));
    setSearchResults([
      { filename: 'negative_0042.jpg', confidence: 95, url: 'https://via.placeholder.com/300x200?text=Result+1' },
      { filename: 'negative_0103.jpg', confidence: 88, url: 'https://via.placeholder.com/300x200?text=Result+2' },
      { filename: 'negative_0256.jpg', confidence: 82, url: 'https://via.placeholder.com/300x200?text=Result+3' }
    ]);
    setLoading(false);
  };

  const handleNameInput = (value) => {
    setPersonName(value);
    if (value.length > 1) {
      // Filter suggestions
      const filtered = mockPeople.filter(name => 
        name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  if (searchMode === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-slate-800">Photo Archive Search</h1>
              <button
                onClick={() => setSearchMode('tag')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Tag Faces
              </button>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by person name, label, location, or text..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Found {searchResults.length} photos</h2>
              <div className="grid grid-cols-3 gap-4">
                {searchResults.map((result, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                    <img src={result.url} alt={result.filename} className="w-full h-48 object-cover" />
                    <div className="p-3">
                      <p className="font-medium text-sm text-slate-700">{result.filename}</p>
                      <p className="text-xs text-slate-500 mt-1">Confidence: {result.confidence}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Face Tagging System</h1>
              <p className="text-slate-600 mt-1">
                Identify people in {untaggedFaces.length} photos • {taggedCount} tagged today
              </p>
            </div>
            <button
              onClick={() => setSearchMode('search')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Photos
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progress</span>
              <span>{currentIndex + 1} of {untaggedFaces.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / untaggedFaces.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {currentFace ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Photo Display */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  {currentFace.filename}
                </h2>
                <div className="flex gap-4 text-sm text-slate-600">
                  <span>Age: {currentFace.age_range.Low}-{currentFace.age_range.High}</span>
                  <span>•</span>
                  <span>{currentFace.gender.Value}</span>
                  <span>•</span>
                  <span>{currentFace.gender.Confidence.toFixed(0)}% confidence</span>
                </div>
              </div>

              <div className="relative bg-slate-100 rounded-lg overflow-hidden">
                <img 
                  src={currentFace.s3_url} 
                  alt={currentFace.filename}
                  className="w-full h-auto"
                />
                {/* Face bounding box overlay */}
                <div 
                  className="absolute border-4 border-blue-500 rounded"
                  style={{
                    left: `${currentFace.bounding_box.Left * 100}%`,
                    top: `${currentFace.bounding_box.Top * 100}%`,
                    width: `${currentFace.bounding_box.Width * 100}%`,
                    height: `${currentFace.bounding_box.Height * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Tagging Panel */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Quick Actions
                </h3>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {mockPeople.map((name, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTag(name)}
                      disabled={loading}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition disabled:opacity-50 text-sm"
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (currentIndex < untaggedFaces.length - 1) {
                      setCurrentIndex(currentIndex + 1);
                    }
                  }}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Skip this face →
                </button>
              </div>

              {/* Manual Entry */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-600" />
                  Add New Person
                </h3>

                <div className="relative">
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => handleNameInput(e.target.value)}
                    placeholder="Enter person's name..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && personName && handleTag(personName)}
                  />

                  {/* Suggestions dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                      {suggestions.map((name, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setPersonName(name);
                            setSuggestions([]);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleTag(personName)}
                    disabled={!personName || loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Tag This Face
                  </button>
                </div>

                <button
                  onClick={() => handleTagSimilar(personName)}
                  disabled={!personName || loading}
                  className="w-full mt-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Tag + Find Similar Faces
                </button>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-3">Session Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm">Tagged Today</p>
                    <p className="text-3xl font-bold">{taggedCount}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Remaining</p>
                    <p className="text-3xl font-bold">{untaggedFaces.length - currentIndex - 1}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">All Done!</h2>
            <p className="text-slate-600">You've tagged all available faces.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceTaggingInterface;