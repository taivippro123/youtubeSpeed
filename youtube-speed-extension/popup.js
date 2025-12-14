// Load settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const keywordsTextarea = document.getElementById('keywords');
  const categoryKeywordsTextarea = document.getElementById('categoryKeywords');
  const slowSpeedInput = document.getElementById('slowSpeed');
  const fastSpeedInput = document.getElementById('fastSpeed');
  const enabledCheckbox = document.getElementById('enabled');
  const checkTitleCheckbox = document.getElementById('checkTitle');
  const checkTagsCheckbox = document.getElementById('checkTags');
  const checkCategoryCheckbox = document.getElementById('checkCategory');
  const checkChannelTypeCheckbox = document.getElementById('checkChannelType');
  const useYouTubeAPICheckbox = document.getElementById('useYouTubeAPI');
  const youtubeApiKeyInput = document.getElementById('youtubeApiKey');
  const youtubeApiSection = document.getElementById('youtubeApiSection');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Show/hide API key section
  useYouTubeAPICheckbox.addEventListener('change', () => {
    youtubeApiSection.style.display = useYouTubeAPICheckbox.checked ? 'block' : 'none';
  });

  // Load saved settings
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

  if (result.keywords && result.keywords.length > 0) {
    keywordsTextarea.value = result.keywords.join('\n');
  }
  if (result.categoryKeywords && result.categoryKeywords.length > 0) {
    categoryKeywordsTextarea.value = result.categoryKeywords.join('\n');
  }
  if (result.slowSpeed !== undefined) {
    slowSpeedInput.value = result.slowSpeed;
  }
  if (result.fastSpeed !== undefined) {
    fastSpeedInput.value = result.fastSpeed;
  }
  // Default to enabled (true) if not set
  enabledCheckbox.checked = result.enabled !== undefined ? result.enabled : true;
  checkTitleCheckbox.checked = result.checkTitle !== undefined ? result.checkTitle : true;
  checkTagsCheckbox.checked = result.checkTags !== undefined ? result.checkTags : true;
  checkCategoryCheckbox.checked = result.checkCategory !== undefined ? result.checkCategory : true;
  checkChannelTypeCheckbox.checked = result.checkChannelType !== undefined ? result.checkChannelType : false;
  useYouTubeAPICheckbox.checked = result.useYouTubeAPI !== undefined ? result.useYouTubeAPI : false;
  if (result.youtubeApiKey) {
    youtubeApiKeyInput.value = result.youtubeApiKey;
  }
  // Show/hide section based on checkbox
  youtubeApiSection.style.display = useYouTubeAPICheckbox.checked ? 'block' : 'none';

  // Save button handler
  saveBtn.addEventListener('click', async () => {
    const keywords = keywordsTextarea.value
      .split('\n')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    const categoryKeywords = categoryKeywordsTextarea.value
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const slowSpeed = parseFloat(slowSpeedInput.value);
    const fastSpeed = parseFloat(fastSpeedInput.value);

    if (isNaN(slowSpeed) || slowSpeed < 0.25 || slowSpeed > 4) {
      showStatus('Tốc độ chậm phải từ 0.25 đến 4', 'error');
      return;
    }

    if (isNaN(fastSpeed) || fastSpeed < 0.25 || fastSpeed > 4) {
      showStatus('Tốc độ nhanh phải từ 0.25 đến 4', 'error');
      return;
    }

    try {
      await chrome.storage.sync.set({
        keywords: keywords,
        categoryKeywords: categoryKeywords,
        slowSpeed: slowSpeed,
        fastSpeed: fastSpeed,
        enabled: enabledCheckbox.checked,
        checkTitle: checkTitleCheckbox.checked,
        checkTags: checkTagsCheckbox.checked,
        checkCategory: checkCategoryCheckbox.checked,
        checkChannelType: checkChannelTypeCheckbox.checked,
        useYouTubeAPI: useYouTubeAPICheckbox.checked,
        youtubeApiKey: youtubeApiKeyInput.value.trim()
      });

      // Notify content script to reload settings
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url && tab.url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tab.id, { action: 'reloadSettings' });
      }

      showStatus('Đã lưu cài đặt!', 'success');
    } catch (error) {
      showStatus('Lỗi khi lưu: ' + error.message, 'error');
    }
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    setTimeout(() => {
      statusDiv.className = 'status';
    }, 3000);
  }
});

