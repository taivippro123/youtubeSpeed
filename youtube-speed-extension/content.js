// YouTube Auto Speed Content Script

let settings = {
  keywords: ['remix', 'nhạc', 'mv', 'official mv lyrics', 'music'],
  categoryKeywords: ['Âm nhạc', 'Music', 'Nhạc'],
  slowSpeed: 1,
  fastSpeed: 2,
  enabled: true,
  checkTitle: true,
  checkTags: true,
  checkCategory: true,
  checkChannelType: false,
  useYouTubeAPI: false,
  youtubeApiKey: ''
};

let currentVideoId = null;
let lastAppliedSpeed = null;
// YouTube category ID for Music = 10
const YOUTUBE_MUSIC_CATEGORY_ID = 10;

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'keywords',
      'categoryKeywords',
      'slowSpeed',
      'fastSpeed',
      'enabled',
      'checkTitle',
      'checkTags',
      'checkCategory',
      'checkChannelType',
      'useYouTubeAPI',
      'youtubeApiKey'
    ]);

    if (result.keywords && Array.isArray(result.keywords)) {
      settings.keywords = result.keywords;
    }
    if (result.categoryKeywords && Array.isArray(result.categoryKeywords)) {
      settings.categoryKeywords = result.categoryKeywords;
    }
    if (result.slowSpeed !== undefined) {
      settings.slowSpeed = parseFloat(result.slowSpeed);
    }
    if (result.fastSpeed !== undefined) {
      settings.fastSpeed = parseFloat(result.fastSpeed);
    }
    // Default to enabled (true) if not set
    settings.enabled = result.enabled !== undefined ? result.enabled : true;
    settings.checkTitle = result.checkTitle !== undefined ? result.checkTitle : true;
    settings.checkTags = result.checkTags !== undefined ? result.checkTags : true;
    settings.checkCategory = result.checkCategory !== undefined ? result.checkCategory : true;
    settings.checkChannelType = result.checkChannelType !== undefined ? result.checkChannelType : false;
    settings.useYouTubeAPI = result.useYouTubeAPI !== undefined ? result.useYouTubeAPI : false;
    settings.youtubeApiKey = result.youtubeApiKey || '';
    
    console.log('YouTube Auto Speed: Settings loaded', settings);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Check if video title contains any keyword
function containsKeyword(text) {
  if (!text || !settings.keywords || settings.keywords.length === 0) {
    return false;
  }

  const lowerText = text.toLowerCase();
  const found = settings.keywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  console.log('YouTube Auto Speed: Checking keywords', {
    text: text.substring(0, 50),
    keywords: settings.keywords,
    found: found
  });
  
  return found;
}

// Get video title - improved selectors
function getVideoTitle() {
  // Try multiple selectors for YouTube title
  const selectors = [
    'h1.ytd-watch-metadata yt-formatted-string',
    'h1.ytd-video-primary-info-renderer yt-formatted-string',
    'h1 yt-formatted-string',
    '.ytd-watch-metadata h1 yt-formatted-string',
    'h1[class*="title"]',
    'ytd-watch-metadata h1',
    '#title h1',
    '#title yt-formatted-string'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const title = element.textContent || element.innerText || element.title || '';
      if (title.trim()) {
        return title.trim();
      }
    }
  }
  
  // Fallback: try to get from meta tag
  const metaTitle = document.querySelector('meta[property="og:title"]');
  if (metaTitle) {
    return metaTitle.getAttribute('content') || '';
  }
  
  return '';
}

// Get video category/genre (if available)
function getVideoCategory() {
  // Try multiple selectors for category
  const selectors = [
    'ytd-metadata-row-renderer[title="Category"]',
    'ytd-metadata-row-renderer[title="Thể loại"]',
    '#info-strings yt-formatted-string',
    '.ytd-watch-metadata yt-formatted-string[class*="category"]'
  ];

  // Patterns to exclude (like premiere dates)
  const excludePatterns = [
    'đã công chiếu',
    'premiered',
    'premiere',
    'published',
    'đã tải lên',
    'uploaded',
    'thg',
    'ngày'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent || element.innerText || '';
      const trimmed = text.trim();
      if (trimmed) {
        // Check if it's not a date/premiere info
        const lowerText = trimmed.toLowerCase();
        const isExcluded = excludePatterns.some(pattern => lowerText.includes(pattern));
        if (!isExcluded) {
          return trimmed;
        }
      }
    }
  }

  // Try to find category keywords in sections on the page
  // Search for category section by text content using user-defined keywords
  // NOTE: This is less reliable, only use if we find explicit music carousel
  if (settings.categoryKeywords && settings.categoryKeywords.length > 0) {
    // Only check for explicit music carousel shelf (most reliable indicator)
    const musicCarousel = document.querySelector('ytd-music-carousel-shelf-renderer');
    if (musicCarousel) {
      // Only return if we find explicit music carousel
      return settings.categoryKeywords[0] || 'Music';
    }
    
    // Don't search in all elements as it's too error-prone
    // Only check specific music-related sections
    const musicSections = document.querySelectorAll('ytd-music-carousel-shelf-renderer, [class*="music-carousel"]');
    for (const element of musicSections) {
      const text = (element.textContent || element.innerText || '').toLowerCase();
      // Check if text contains any category keyword
      for (const categoryKeyword of settings.categoryKeywords) {
        if (text.includes(categoryKeyword.toLowerCase())) {
          return categoryKeyword;
        }
      }
    }
  }

  // Try to get from YouTube internal data
  try {
    const ytInitialData = window.ytInitialData;
    if (ytInitialData?.contents) {
      // Check all contents for category-related sections using user-defined keywords
      if (settings.categoryKeywords && settings.categoryKeywords.length > 0) {
        const allContents = ytInitialData.contents?.twoColumnWatchNextResults?.secondaryResults?.secondaryResults?.results || [];
        for (const content of allContents) {
          // Check for music carousel shelf (always indicates music - most reliable)
          if (content.musicCarouselShelfRenderer) {
            // Only return if we have explicit music carousel
            return settings.categoryKeywords[0] || 'Music';
          }
          // Don't check shelf renderer titles as they're too error-prone
          // Only trust explicit music carousel
        }
      }

      // Try to get category from metadata
      const metadataRows = ytInitialData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer?.metadataRowContainer?.metadataRowContainerRenderer?.rows;
      if (metadataRows) {
        for (const row of metadataRows) {
          const title = row.metadataRowRenderer?.title?.simpleText || row.metadataRowRenderer?.title?.runs?.[0]?.text || '';
          if (title.toLowerCase().includes('category') || title.toLowerCase().includes('thể loại')) {
            const content = row.metadataRowRenderer?.contents?.[0]?.simpleText || row.metadataRowRenderer?.contents?.[0]?.runs?.[0]?.text || '';
            if (content && !excludePatterns.some(p => content.toLowerCase().includes(p))) {
              return content;
            }
          }
        }
      }

      // Check video details for category
      const videoDetails = ytInitialData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer;
      if (videoDetails) {
        // Check if there's a music indicator in video info
        const videoInfo = videoDetails.videoActions?.menuRenderer?.topLevelButtons || [];
        // This is a fallback check
      }
    }
  } catch (e) {
    // Ignore errors
  }

  // Try to get from page data (JSON-LD)
  try {
      const pageData = document.querySelector('script[type="application/ld+json"]');
      if (pageData) {
        const data = JSON.parse(pageData.textContent);
        if (data.genre) {
          // Check if genre matches any category keyword
          if (settings.categoryKeywords && settings.categoryKeywords.length > 0) {
            const genreLower = data.genre.toLowerCase();
            for (const categoryKeyword of settings.categoryKeywords) {
              if (genreLower.includes(categoryKeyword.toLowerCase())) {
                return categoryKeyword;
              }
            }
          }
          return data.genre;
        }
        // Check if it's a MusicRecording type (reliable indicator)
        if (data['@type'] === 'MusicRecording' || data['@type'] === 'MusicVideoObject') {
          // This is a reliable indicator, return category keyword
          return settings.categoryKeywords && settings.categoryKeywords.length > 0 ? settings.categoryKeywords[0] : 'Music';
        }
      }
  } catch (e) {
    // Ignore JSON parse errors
  }

  return '';
}

// Get video tags
function getVideoTags() {
  const tags = [];
  
  // Try to get tags from metadata rows
  const tagElements = document.querySelectorAll('ytd-metadata-row-renderer[title="Tags"] a, ytd-metadata-row-renderer[title="Thẻ"] a');
  tagElements.forEach(el => {
    const tag = el.textContent || el.innerText || '';
    if (tag.trim()) {
      tags.push(tag.trim());
    }
  });

  // Try to get hashtags from description
  const descriptionSelectors = [
    '#description',
    '#description-text',
    'ytd-expander #content',
    'ytd-video-secondary-info-renderer #description'
  ];
  
  for (const selector of descriptionSelectors) {
    const descElement = document.querySelector(selector);
    if (descElement) {
      const descText = descElement.textContent || descElement.innerText || '';
      // Extract hashtags (format: #word)
      const hashtagRegex = /#(\w+)/g;
      const matches = descText.match(hashtagRegex);
      if (matches) {
        matches.forEach(hashtag => {
          const tag = hashtag.substring(1); // Remove #
          if (tag && !tags.includes(tag)) {
            tags.push(tag);
          }
        });
      }
    }
  }

  // Try to get from YouTube's internal data
  try {
    const ytInitialData = window.ytInitialData;
    if (ytInitialData && ytInitialData.contents) {
      // Get tags from video details
      const videoDetails = ytInitialData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer;
      if (videoDetails?.superTitleLink?.runs) {
        videoDetails.superTitleLink.runs.forEach(run => {
          if (run.text) {
            const tag = run.text.trim();
            if (tag && !tags.includes(tag)) {
              tags.push(tag);
            }
          }
        });
      }

      // Get tags from video secondary info (description)
      const secondaryInfo = ytInitialData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer;
      if (secondaryInfo?.description?.runs) {
        secondaryInfo.description.runs.forEach(run => {
          if (run.text) {
            // Extract hashtags from description text
            const hashtagRegex = /#(\w+)/g;
            const matches = run.text.match(hashtagRegex);
            if (matches) {
              matches.forEach(hashtag => {
                const tag = hashtag.substring(1);
                if (tag && !tags.includes(tag)) {
                  tags.push(tag);
                }
              });
            }
          }
        });
      }

      // Get tags from video metadata
      const videoMetadata = ytInitialData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer?.metadataRowContainer?.metadataRowContainerRenderer?.rows;
      if (videoMetadata) {
        for (const row of videoMetadata) {
          const title = row.metadataRowRenderer?.title?.simpleText || row.metadataRowRenderer?.title?.runs?.[0]?.text || '';
          if (title.toLowerCase().includes('tag') || title.toLowerCase().includes('thẻ')) {
            const contents = row.metadataRowRenderer?.contents;
            if (contents) {
              contents.forEach(content => {
                const tagText = content.simpleText || content.runs?.[0]?.text || '';
                if (tagText) {
                  const tag = tagText.trim();
                  if (tag && !tags.includes(tag)) {
                    tags.push(tag);
                  }
                }
              });
            }
          }
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  // Try to get from page data (JSON-LD)
  try {
    const pageData = document.querySelector('script[type="application/ld+json"]');
    if (pageData) {
      const data = JSON.parse(pageData.textContent);
      if (data.keywords && Array.isArray(data.keywords)) {
        data.keywords.forEach(keyword => {
          if (keyword && !tags.includes(keyword)) {
            tags.push(keyword);
          }
        });
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  return tags.join(' ').toLowerCase();
}

// Get channel type/name
function getChannelType() {
  // Get channel name
  const channelSelectors = [
    'ytd-channel-name a',
    '#channel-name a',
    'ytd-video-owner-renderer #channel-name a',
    'ytd-watch-metadata #channel-name a'
  ];

  let channelName = '';
  for (const selector of channelSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      channelName = (element.textContent || element.innerText || '').trim();
      if (channelName) break;
    }
  }

  // Try to get channel type from YouTube data
  try {
    const ytInitialData = window.ytInitialData;
    if (ytInitialData?.contents) {
      const channelInfo = ytInitialData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer?.owner?.videoOwnerRenderer;
      
      // Check badges for music indicators
      if (channelInfo?.badges) {
        const badges = channelInfo.badges;
        for (const badge of badges) {
          const label = badge.metadataBadgeRenderer?.label?.toLowerCase() || '';
          if (label.includes('music') || label.includes('nhạc') || label.includes('artist') || label.includes('producer')) {
            return 'music';
          }
        }
      }

      // Check channel handle/ID for music indicators
      const channelHandle = channelInfo?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || '';
      if (channelHandle) {
        const handleLower = channelHandle.toLowerCase();
        if (handleLower.includes('topic') || handleLower.includes('music') || handleLower.includes('vevo')) {
          return 'music';
        }
      }

      // Check channel description for music-related keywords
      const channelDescription = channelInfo?.subscriberCountText?.simpleText || '';
      // Also try to get from channel page data if available
      const channelMetadata = ytInitialData.metadata?.channelMetadataRenderer;
      if (channelMetadata?.description) {
        const desc = channelMetadata.description.toLowerCase();
        const musicKeywords = ['music', 'nhạc', 'producer', 'artist', 'musician', 'singer', 'rapper', 'hip hop', 'hiphop', 'beat', 'sound', 'audio', 'song', 'track'];
        if (musicKeywords.some(keyword => desc.includes(keyword))) {
          return 'music';
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  // Try to detect if it's a music channel by name patterns
  // Common patterns: "Topic", "VEVO", "Music", etc.
  const musicIndicators = ['topic', 'vevo', 'music', 'nhạc', 'official', 'producer', 'artist', 'musician', 'singer', 'rapper'];
  const lowerChannelName = channelName.toLowerCase();
  
  if (musicIndicators.some(indicator => lowerChannelName.includes(indicator))) {
    return 'music';
  }

  // Return channel name as fallback (might contain useful info)
  return channelName;
}

// Get video category from YouTube Data API (most accurate)
async function getVideoCategoryFromYouTubeAPI(videoId) {
  console.log('YouTube Auto Speed: getVideoCategoryFromYouTubeAPI called', {
    useYouTubeAPI: settings.useYouTubeAPI,
    hasApiKey: !!settings.youtubeApiKey,
    videoId: videoId
  });

  if (!settings.useYouTubeAPI || !settings.youtubeApiKey || !videoId) {
    console.log('YouTube Auto Speed: YouTube API not enabled or missing key/videoId');
    return null;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${settings.youtubeApiKey}`;
    console.log('YouTube Auto Speed: Calling YouTube API...', { url: url.replace(settings.youtubeApiKey, 'API_KEY_HIDDEN') });
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('YouTube Auto Speed: YouTube API response', {
      status: response.status,
      hasItems: !!(data.items && data.items.length > 0),
      error: data.error,
      data: data
    });
    
    if (data.items && data.items.length > 0) {
      const snippet = data.items[0].snippet;
      const categoryId = snippet?.categoryId;
      const categoryTitle = snippet?.categoryTitle;
      
      // Log category information
      console.log('YouTube Auto Speed: YouTube API Category Info', {
        categoryId: categoryId,
        categoryTitle: categoryTitle,
        videoId: videoId,
        fullSnippet: snippet
      });
      
      // YouTube category ID 10 = Music
      if (categoryId == YOUTUBE_MUSIC_CATEGORY_ID) {
        return 'Music';
      }
      // Also check category name
      if (categoryTitle && settings.categoryKeywords) {
        const lowerTitle = categoryTitle.toLowerCase();
        for (const keyword of settings.categoryKeywords) {
          if (lowerTitle.includes(keyword.toLowerCase())) {
            return keyword;
          }
        }
      }
      
      // Return category title even if not matching keywords (for logging)
      return categoryTitle || null;
    } else {
      console.log('YouTube Auto Speed: YouTube API returned no items', data);
    }
  } catch (error) {
    console.error('YouTube Auto Speed: YouTube API error', error);
  }
  
  return null;
}

// Improved heuristics with scoring system
function getVideoCategoryScore(title, tags, category, channelType) {
  let score = 0;
  const combinedText = `${title} ${tags} ${category} ${channelType}`.toLowerCase();

  // Strong indicators (high score)
  const strongIndicators = ['music', 'nhạc', 'song', 'track', 'album', 'artist', 'singer', 'rapper', 'beat', 'sound', 'audio', 'mv', 'music video'];
  strongIndicators.forEach(indicator => {
    if (combinedText.includes(indicator)) {
      score += 3;
    }
  });

  // Medium indicators
  const mediumIndicators = ['remix', 'cover', 'lyrics', 'official', 'vevo', 'topic'];
  mediumIndicators.forEach(indicator => {
    if (combinedText.includes(indicator)) {
      score += 2;
    }
  });

  // Category keywords match
  if (settings.categoryKeywords) {
    settings.categoryKeywords.forEach(keyword => {
      if (combinedText.includes(keyword.toLowerCase())) {
        score += 5; // Very strong indicator
      }
    });
  }

  // Music carousel shelf detected
  if (category && (category.includes('Music') || category.includes('Âm nhạc'))) {
    score += 5;
  }

  // Channel type indicators
  if (channelType && typeof channelType === 'string') {
    const lowerChannel = channelType.toLowerCase();
    if (lowerChannel.includes('music') || lowerChannel.includes('nhạc') || lowerChannel.includes('producer') || lowerChannel.includes('artist')) {
      score += 3;
    }
  }

  return score;
}

// Set video playback speed
function setPlaybackSpeed(speed) {
  const video = document.querySelector('video');
  if (video) {
    // Only set if different to avoid unnecessary changes
    if (Math.abs(video.playbackRate - speed) > 0.01) {
      video.playbackRate = speed;
      lastAppliedSpeed = speed;
      console.log(`YouTube Auto Speed: Set playback rate to ${speed}x`);
    }
  } else {
    console.warn('YouTube Auto Speed: Video element not found');
  }
}

// Check and adjust speed for current video
async function checkAndAdjustSpeed() {
  console.log('YouTube Auto Speed: checkAndAdjustSpeed called', {
    enabled: settings.enabled,
    currentVideoId: currentVideoId
  });

  if (!settings.enabled) {
    console.log('YouTube Auto Speed: Extension is disabled - skipping');
    return;
  }

  const video = document.querySelector('video');
  if (!video) {
    console.log('YouTube Auto Speed: No video element found');
    return;
  }

  let isMusic = false;
  let detectionMethod = 'none';

  // Method 1: YouTube Data API (most accurate, priority 1)
  // Always log to help debug
  console.log('YouTube Auto Speed: Checking YouTube API', {
    useYouTubeAPI: settings.useYouTubeAPI,
    hasApiKey: !!settings.youtubeApiKey,
    apiKeyLength: settings.youtubeApiKey ? settings.youtubeApiKey.length : 0,
    currentVideoId: currentVideoId,
    settings: {
      useYouTubeAPI: settings.useYouTubeAPI,
      youtubeApiKey: settings.youtubeApiKey ? '***' + settings.youtubeApiKey.slice(-4) : 'missing'
    }
  });

  if (settings.useYouTubeAPI && settings.youtubeApiKey && currentVideoId) {
    const apiCategory = await getVideoCategoryFromYouTubeAPI(currentVideoId);
    console.log('YouTube Auto Speed: API category result', apiCategory);
    
    if (apiCategory) {
      // Check if category matches keywords or is Music category ID
      const lowerCategory = apiCategory.toLowerCase();
      const matchesKeyword = settings.categoryKeywords?.some(keyword => 
        lowerCategory.includes(keyword.toLowerCase())
      ) || lowerCategory === 'music';
      
      if (matchesKeyword) {
        isMusic = true;
        detectionMethod = 'YouTube API';
        console.log('YouTube Auto Speed: Detected via YouTube API:', apiCategory);
      } else {
        // Log category even if not matching (for debugging)
        console.log('YouTube Auto Speed: YouTube API category (not matching):', apiCategory);
      }
    } else {
      console.log('YouTube Auto Speed: YouTube API returned null/empty category');
    }
  } else {
    console.log('YouTube Auto Speed: YouTube API conditions not met', {
      useYouTubeAPI: settings.useYouTubeAPI,
      hasApiKey: !!settings.youtubeApiKey,
      hasVideoId: !!currentVideoId
    });
  }

  // Method 2: Improved heuristics with scoring (fallback)
  // Only use if YouTube API didn't find anything
  if (!isMusic) {
    const title = settings.checkTitle ? getVideoTitle() : '';
    const tags = settings.checkTags ? getVideoTags() : '';
    // Only get category if we're not using YouTube API (to avoid false positives)
    // Or if YouTube API failed, we can use it as fallback
    const category = (settings.checkCategory && !settings.useYouTubeAPI) ? getVideoCategory() : '';
    const channelType = settings.checkChannelType ? getChannelType() : '';

    console.log('YouTube Auto Speed: Video info (heuristics)', {
      title: title.substring(0, 50),
      tags: tags.substring(0, 50),
      category: category,
      channelType: channelType,
      note: 'Category only checked if YouTube API not enabled'
    });

    // Calculate score (without category if using YouTube API)
    const score = getVideoCategoryScore(title, tags, category, channelType);
    const threshold = 5; // Minimum score to consider as music
    
    if (score >= threshold) {
      isMusic = true;
      detectionMethod = `Heuristics (score: ${score})`;
      console.log('YouTube Auto Speed: Detected via heuristics, score:', score);
    }

    // Also check traditional keyword matching (without category if using YouTube API)
    if (!isMusic) {
      const textSources = [];
      if (title) textSources.push(title);
      if (tags) textSources.push(tags);
      // Only include category if not using YouTube API
      if (category && !settings.useYouTubeAPI) {
        textSources.push(category);
      }
      if (channelType) textSources.push(channelType);
      const combinedText = textSources.join(' ').toLowerCase();
      
      console.log('YouTube Auto Speed: Keyword matching', {
        combinedText: combinedText.substring(0, 100),
        keywords: settings.keywords
      });
      
      isMusic = containsKeyword(combinedText);
      if (isMusic) {
        detectionMethod = 'Keyword matching';
        console.log('YouTube Auto Speed: Matched keyword in:', {
          title: title ? 'yes' : 'no',
          tags: tags ? 'yes' : 'no',
          category: category ? 'yes' : 'no',
          channelType: channelType ? 'yes' : 'no'
        });
      }
    }
  }

  const targetSpeed = isMusic ? settings.slowSpeed : settings.fastSpeed;

  console.log('YouTube Auto Speed: Decision', {
    isMusic: isMusic,
    detectionMethod: detectionMethod,
    targetSpeed: targetSpeed,
    slowSpeed: settings.slowSpeed,
    fastSpeed: settings.fastSpeed,
    currentSpeed: video.playbackRate
  });

  setPlaybackSpeed(targetSpeed);
}

// Get current video ID from URL
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Wait for video and title to be ready, then adjust speed
function waitAndAdjustSpeed(maxAttempts = 15) {
  let attempts = 0;
  
  const checkInterval = setInterval(() => {
    attempts++;
    const video = document.querySelector('video');
    const title = getVideoTitle();
    const videoId = getVideoId();
    
    if (video && videoId) {
      // If we have title, check immediately
      if (title) {
        clearInterval(checkInterval);
        // Use requestAnimationFrame for immediate execution
        requestAnimationFrame(() => {
          checkAndAdjustSpeed();
        });
      } else if (attempts >= 5) {
        // If no title after 5 attempts (1 second), check anyway with empty title
        clearInterval(checkInterval);
        requestAnimationFrame(() => {
          checkAndAdjustSpeed();
        });
      }
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      // Try anyway even if title not found
      if (video && videoId) {
        requestAnimationFrame(() => {
          checkAndAdjustSpeed();
        });
      }
    }
  }, 100); // Reduced from 200ms to 100ms
}

// Watch for video changes
function watchForVideoChanges() {
  const newVideoId = getVideoId();
  
  if (newVideoId && newVideoId !== currentVideoId) {
    console.log('YouTube Auto Speed: Video changed', {
      old: currentVideoId,
      new: newVideoId
    });
    currentVideoId = newVideoId;
    lastAppliedSpeed = null; // Reset to allow re-applying speed
    
    // Try to set speed immediately if video element exists
    const video = document.querySelector('video');
    if (video) {
      // Set speed immediately, then refine when title is available
      requestAnimationFrame(() => {
        waitAndAdjustSpeed();
      });
    } else {
      waitAndAdjustSpeed();
    }
  }
}

// Initialize
async function init() {
  await loadSettings();
  
  // Get initial video ID
  currentVideoId = getVideoId();
  
  // Check speed immediately if on a video page
  if (currentVideoId) {
    waitAndAdjustSpeed();
  }

  // Watch for URL changes (SPA navigation)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      watchForVideoChanges();
    }
  });

  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Watch for video element changes
  const videoObserver = new MutationObserver(() => {
    watchForVideoChanges();
  });

  const videoContainer = document.querySelector('#movie_player') || document.body;
  if (videoContainer) {
    videoObserver.observe(videoContainer, {
      childList: true,
      subtree: true
    });
  }

  // Listen for YouTube navigation events
  window.addEventListener('yt-navigate-finish', () => {
    console.log('YouTube Auto Speed: Navigation finished');
    // Force check even if video ID hasn't changed
    currentVideoId = null; // Reset to force detection
    watchForVideoChanges();
    // Try to adjust speed immediately, then retry if needed
    requestAnimationFrame(() => {
      waitAndAdjustSpeed();
    });
  }, true);

  // Listen for video load events
  document.addEventListener('yt-page-data-updated', () => {
    console.log('YouTube Auto Speed: Page data updated');
    // Force check even if video ID hasn't changed
    currentVideoId = null; // Reset to force detection
    watchForVideoChanges();
    // Try to adjust speed immediately, then retry if needed
    requestAnimationFrame(() => {
      waitAndAdjustSpeed();
    });
  }, true);

  // Periodic check as fallback (every 2 seconds - faster detection)
  setInterval(() => {
    watchForVideoChanges();
  }, 2000);

  // Watch for video element being added to DOM
  const videoAddedObserver = new MutationObserver((mutations) => {
    const video = document.querySelector('video');
    if (video && !video.dataset.speedListenerAdded) {
      video.dataset.speedListenerAdded = 'true';
      
      // Set speed immediately when video is found
      requestAnimationFrame(() => {
        watchForVideoChanges();
        waitAndAdjustSpeed();
      });
      
      // Listen to video load events
      video.addEventListener('loadeddata', () => {
        console.log('YouTube Auto Speed: Video data loaded');
        requestAnimationFrame(() => {
          checkAndAdjustSpeed();
        });
      }, { once: true });

      // Listen to video canplay event (fires earlier than loadeddata)
      video.addEventListener('canplay', () => {
        requestAnimationFrame(() => {
          checkAndAdjustSpeed();
        });
      }, { once: true });

      // Listen to video ratechange events as backup
      video.addEventListener('ratechange', () => {
        // If speed was changed manually, don't override immediately
        // But check after a short delay
        setTimeout(() => {
          if (lastAppliedSpeed && Math.abs(video.playbackRate - lastAppliedSpeed) > 0.01) {
            console.log('YouTube Auto Speed: Speed changed externally, re-applying');
            checkAndAdjustSpeed();
          }
        }, 500); // Reduced from 1000ms
      });
    }
  });

  videoAddedObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'reloadSettings') {
    loadSettings().then(() => {
      checkAndAdjustSpeed();
      sendResponse({ success: true });
    });
    return true;
  }
});

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

