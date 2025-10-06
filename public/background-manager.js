const TOTAL_IMAGES_PER_PERIOD = 10;
let lastImageIndex = null;
let lastPeriod = null;
let preloadedImages = {};

function getJakartaTime() {
  return new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    hour12: false
  });
}

function getCurrentPeriod() {
  const jakartaHour = parseInt(getJakartaTime());
  
  if (jakartaHour >= 5 && jakartaHour < 11) {
    return 'pagi';
  } else if (jakartaHour >= 11 && jakartaHour < 15) {
    return 'siang';
  } else if (jakartaHour >= 15 && jakartaHour < 18) {
    return 'sore';
  } else {
    return 'malam';
  }
}

function getRandomImageIndex() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * TOTAL_IMAGES_PER_PERIOD) + 1;
  } while (newIndex === lastImageIndex && TOTAL_IMAGES_PER_PERIOD > 1);
  
  return newIndex;
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    if (preloadedImages[src]) {
      resolve(preloadedImages[src]);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      preloadedImages[src] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function setBackgroundByTime() {
  const period = getCurrentPeriod();
  
  if (period !== lastPeriod) {
    lastPeriod = period;
    lastImageIndex = null;
  }
  
  const currentImageIndex = getRandomImageIndex();
  lastImageIndex = currentImageIndex;
  
  const backgroundImage = `img/${period}/bg-${currentImageIndex}.jpg`;
  
  preloadImage(backgroundImage)
    .then(() => {
      document.body.style.backgroundImage = `url('${backgroundImage}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundRepeat = 'no-repeat';
    })
    .catch(() => {
      console.warn(`Failed to load: ${backgroundImage}`);
      document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    });
}

function preloadNextImages() {
  const period = getCurrentPeriod();
  const currentIndex = lastImageIndex || 1;
  
  for (let i = 1; i <= 3; i++) {
    let nextIndex = currentIndex + i;
    if (nextIndex > TOTAL_IMAGES_PER_PERIOD) {
      nextIndex = nextIndex - TOTAL_IMAGES_PER_PERIOD;
    }
    const nextImage = `img/${period}/bg-${nextIndex}.jpg`;
    preloadImage(nextImage).catch(() => {});
  }
}

function updateGreeting() {
  const period = getCurrentPeriod();
  const greetingEl = document.getElementById('greeting');
  
  if (greetingEl) {
    const greetings = {
      'pagi': 'Selamat Pagi',
      'siang': 'Selamat Siang',
      'sore': 'Selamat Sore',
      'malam': 'Selamat Malam'
    };
    greetingEl.textContent = greetings[period];
  }
}

function updateDateTime() {
  const dateEl = document.getElementById('datetime');
  if (dateEl) {
    const now = new Date();
    const jakartaTime = now.toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    dateEl.textContent = jakartaTime;
  }
}

setBackgroundByTime();
updateGreeting();
updateDateTime();

setTimeout(preloadNextImages, 2000);

setInterval(() => {
  setBackgroundByTime();
  setTimeout(preloadNextImages, 1000);
}, 3600000);

setInterval(updateDateTime, 1000);

setInterval(updateGreeting, 3600000);
