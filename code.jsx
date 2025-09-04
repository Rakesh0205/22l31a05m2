import React, { useState, useEffect } from 'react';
import { Link, Copy, BarChart3, Home, Clock, MapPin, MousePointer } from 'lucide-react';

const logger = {
  log: (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);
  },
  info: (message, data) => logger.log('info', message, data),
  error: (message, data) => logger.log('error', message, data),
  warn: (message, data) => logger.log('warn', message, data)
};

const URLShortenerApp = () => {
  const [currentPage, setCurrentPage] = useState('shortener');
  const [urls, setUrls] = useState([]);
  const [formData, setFormData] = useState({
    originalUrl: '',
    validityPeriod: '',
    preferredShortcode: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    logger.info('URL Shortener App initialized');
  }, []);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.originalUrl.trim()) {
      newErrors.originalUrl = 'URL is required';
    } else if (!validateUrl(formData.originalUrl)) {
      newErrors.originalUrl = 'Please enter a valid URL';
    }
    
    if (formData.validityPeriod && (isNaN(formData.validityPeriod) || formData.validityPeriod <= 0)) {
      newErrors.validityPeriod = 'Validity period must be a positive number';
    }
    
    if (formData.preferredShortcode && formData.preferredShortcode.length < 3) {
      newErrors.preferredShortcode = 'Shortcode must be at least 3 characters';
    }

    if (formData.preferredShortcode && urls.some(url => url.shortcode === formData.preferredShortcode)) {
      newErrors.preferredShortcode = 'This shortcode is already taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateShortcode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleShortenUrl = () => {
    if (!validateForm()) {
      logger.warn('Form validation failed', errors);
      return;
    }

    if (urls.length >= 5) {
      setErrors({ general: 'Maximum 5 URLs can be shortened concurrently' });
      logger.warn('Maximum URL limit reached');
      return;
    }

    const shortcode = formData.preferredShortcode || generateShortcode();
    const createdAt = new Date();
    const expiresAt = formData.validityPeriod ? 
      new Date(createdAt.getTime() + formData.validityPeriod * 60 * 1000) : null;

    const newUrl = {
      id: Date.now(),
      originalUrl: formData.originalUrl,
      shortcode,
      shortUrl: `http://localhost:3000/${shortcode}`,
      createdAt,
      expiresAt,
      clicks: 0,
      clickData: []
    };

    setUrls(prev => [...prev, newUrl]);
    setFormData({ originalUrl: '', validityPeriod: '', preferredShortcode: '' });
    setErrors({});
    
    logger.info('URL shortened successfully', { shortcode, originalUrl: formData.originalUrl });
  };

  const handleUrlClick = (urlId) => {
    const clickData = {
      timestamp: new Date(),
      source: 'direct',
      location: 'Mapusa, Goa, IN'
    };

    setUrls(prev => prev.map(url => {
      if (url.id === urlId) {
        if (url.expiresAt && new Date() > url.expiresAt) {
          logger.warn('Attempted to access expired URL', { shortcode: url.shortcode });
          return url;
        }
        
        logger.info('URL clicked', { shortcode: url.shortcode, clicks: url.clicks + 1 });
        return {
          ...url,
          clicks: url.clicks + 1,
          clickData: [...url.clickData, clickData]
        };
      }
      return url;
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      logger.info('URL copied to clipboard', { url: text });
    }).catch(err => {
      logger.error('Failed to copy URL', { error: err.message });
    });
  };

  const isExpired = (expiresAt) => {
    return expiresAt && new Date() > expiresAt;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">URL Shortener</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('shortener')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'shortener' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Home className="inline h-4 w-4 mr-1" />
                Shortener
              </button>
              <button
                onClick={() => setCurrentPage('statistics')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'statistics' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="inline h-4 w-4 mr-1" />
                Statistics
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'shortener' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Shorten Your URLs</h1>
              <p className="text-lg text-gray-600">Create short, memorable links that are easy to share</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Original URL *
                  </label>
                  <input
                    type="url"
                    id="originalUrl"
                    value={formData.originalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalUrl: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.originalUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/very/long/url"
                  />
                  {errors.originalUrl && <p className="text-red-500 text-sm mt-1">{errors.originalUrl}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="validityPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                      Validity Period (minutes)
                    </label>
                    <input
                      type="number"
                      id="validityPeriod"
                      value={formData.validityPeriod}
                      onChange={(e) => setFormData(prev => ({ ...prev, validityPeriod: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.validityPeriod ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="60"
                      min="1"
                    />
                    {errors.validityPeriod && <p className="text-red-500 text-sm mt-1">{errors.validityPeriod}</p>}
                  </div>

                  <div>
                    <label htmlFor="preferredShortcode" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Shortcode
                    </label>
                    <input
                      type="text"
                      id="preferredShortcode"
                      value={formData.preferredShortcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredShortcode: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.preferredShortcode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="mylink"
                      minLength="3"
                    />
                    {errors.preferredShortcode && <p className="text-red-500 text-sm mt-1">{errors.preferredShortcode}</p>}
                  </div>
                </div>

                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleShortenUrl}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Shorten URL
                </button>
              </div>
            </div>

            {urls.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Shortened URLs</h2>
                <div className="space-y-4">
                  {urls.map((url) => (
                    <div
                      key={url.id}
                      className={`border rounded-lg p-4 ${isExpired(url.expiresAt) ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Original URL:</p>
                          <p className="text-gray-900 break-all mb-2">{url.originalUrl}</p>
                          
                          <p className="text-sm text-gray-600 mb-1">Shortened URL:</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`font-mono ${isExpired(url.expiresAt) ? 'text-gray-500' : 'text-blue-600'}`}>
                              {url.shortUrl}
                            </span>
                            <button
                              onClick={() => copyToClipboard(url.shortUrl)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            {!isExpired(url.expiresAt) && (
                              <button
                                onClick={() => handleUrlClick(url.id)}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Test Click
                              </button>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Created: {url.createdAt.toLocaleString()}
                            </span>
                            {url.expiresAt && (
                              <span className={`flex items-center ${isExpired(url.expiresAt) ? 'text-red-600' : ''}`}>
                                <Clock className="h-4 w-4 mr-1" />
                                {isExpired(url.expiresAt) ? 'Expired' : 'Expires'}: {url.expiresAt.toLocaleString()}
                              </span>
                            )}
                            <span className="flex items-center">
                              <MousePointer className="h-4 w-4 mr-1" />
                              Clicks: {url.clicks}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isExpired(url.expiresAt) && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                          This URL has expired and is no longer accessible.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'statistics' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">URL Statistics</h1>
              <p className="text-lg text-gray-600">Analytics and insights for your shortened URLs</p>
            </div>

            {urls.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No URLs Created Yet</h3>
                <p className="text-gray-600 mb-4">Create some shortened URLs to see statistics here.</p>
                <button
                  onClick={() => setCurrentPage('shortener')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Create Your First URL
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {urls.map((url) => (
                  <div key={url.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {url.shortUrl}
                        </h3>
                        <p className="text-gray-600 break-all">{url.originalUrl}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-blue-600">{url.clicks}</div>
                        <div className="text-sm text-gray-600">Total Clicks</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Created: {url.createdAt.toLocaleString()}
                      </div>
                      {url.expiresAt && (
                        <div className={`flex items-center text-sm ${isExpired(url.expiresAt) ? 'text-red-600' : 'text-gray-600'}`}>
                          <Clock className="h-4 w-4 mr-2" />
                          {isExpired(url.expiresAt) ? 'Expired' : 'Expires'}: {url.expiresAt.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {url.clickData.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Click Details</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Source
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Location
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {url.clickData.slice(-5).reverse().map((click, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {click.timestamp.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span className="inline-flex items-center">
                                      <MousePointer className="h-4 w-4 mr-1" />
                                      {click.source}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span className="inline-flex items-center">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {click.location}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {url.clickData.length > 5 && (
                          <p className="text-sm text-gray-500 mt-2">
                            Showing latest 5 clicks out of {url.clickData.length} total clicks
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default URLShortenerApp;
