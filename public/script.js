const videoUpload = document.getElementById('videoUpload');
const videoPreview = document.getElementById('videoPreview');
const captionOverlay = document.getElementById('captionOverlay');
const loadingOverlay = document.getElementById('loading');

let subtitles = [];
let currentTranscription = '';

// API URL for Vercel deployment
const API_URL = '/api/generate';

// Video Upload Handler
videoUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('video/')) {
    alert('Please upload a valid video file');
    return;
  }

  // Reset states
  currentTranscription = '';
  subtitles = [];
  document.getElementById('viralCaption').textContent = '—';
  document.getElementById('hashtagList').textContent = '—';
  
  // Create preview
  const videoUrl = URL.createObjectURL(file);
  videoPreview.src = videoUrl;
  captionOverlay.textContent = 'Processing video...';

  // Simulate real transcription (replace with actual API call in production)
  setTimeout(() => {
    // Simulated transcription from video content
    currentTranscription = "A person demonstrating parkour techniques in an urban environment";
    
    // Generate realistic subtitles
    subtitles = generateSubtitles(currentTranscription);
    
    // Clear overlay
    captionOverlay.textContent = '';
    
    console.log('Subtitles generated:', subtitles);
  }, 2000);
});

// Generate Subtitles from Text
function generateSubtitles(text) {
  // Split text into meaningful segments
  const sentences = text.match(/[^\.!\?]+[\.!\?]*$/g) || [text];
  const segments = [];
  
  // Generate timed subtitles (2 seconds per segment)
  sentences.forEach((sentence, i) => {
    segments.push({
      time: i * 2,
      text: sentence.trim()
    });
  });
  
  return segments;
}

// Handle Video Time Updates
videoPreview.addEventListener('timeupdate', () => {
  const currentTime = videoPreview.currentTime;
  const activeSubtitle = subtitles.find(sub => 
    currentTime >= sub.time && currentTime < (sub.time + 2)
  );
  
  captionOverlay.textContent = activeSubtitle?.text || '';
});

// Style Controls
document.getElementById('fontSelect').addEventListener('change', (e) => {
  captionOverlay.style.fontFamily = e.target.value;
});

document.getElementById('fontSize').addEventListener('input', (e) => {
  captionOverlay.style.fontSize = `${e.target.value}px`;
});

document.getElementById('fontColor').addEventListener('input', (e) => {
  captionOverlay.style.color = e.target.value;
});

// Generate Promo Content
document.getElementById('generatePromo').addEventListener('click', async () => {
  if (!currentTranscription) {
    alert('Please upload a video first');
    return;
  }

  loadingOverlay.classList.add('active');
  const platform = document.getElementById('platformSelect').value;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        text: currentTranscription, 
        platform 
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    const data = await response.json();
    document.getElementById('viralCaption').textContent = data.caption;
    document.getElementById('hashtagList').textContent = data.hashtags;
  } catch (error) {
    console.error('Generation error:', error);
    alert(`Failed to generate content: ${error.message}`);
  } finally {
    loadingOverlay.classList.remove('active');
  }
});

// Format Time for SRT
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(millis, 3)}`;
}

function pad(num, size = 2) {
  return String(num).padStart(size, '0');
}

// Download SRT File
document.getElementById('downloadSubtitles').addEventListener('click', () => {
  if (subtitles.length === 0) {
    alert('No subtitles available. Please process a video first.');
    return;
  }
  
  let srtContent = '';
  subtitles.forEach((sub, index) => {
    const start = formatTime(sub.time);
    const end = formatTime(sub.time + 2);
    srtContent += `${index + 1}\n${start} --> ${end}\n${sub.text}\n\n`;
  });
  
  const blob = new Blob([srtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'captions.srt';
  link.click();
  URL.revokeObjectURL(url);
});
