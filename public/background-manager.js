const TOTAL_IMAGES_PER_PERIOD = 10;
let lastImageIndex = null;
let lastPeriod = null;
let lastHour = null;
let preloadedImages = {};

function getJakartaTime() {
  const now = new Date();
  const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  return {
    hour: jakartaTime.getHours(),
    fullTime: jakartaTime
  };
}

function getCurrentPeriod() {
  const { hour } = getJakartaTime();
  
  if (hour >= 5 && hour < 11) {
    return 'pagi';
  } else if (hour >= 11 && hour < 15) {
    return 'siang';
  } else if (hour >= 15 && hour < 18) {
    return 'sore';
  } else {
    return 'malam';
  }
}

function getImageIndexByHour() {
  const { hour } = getJakartaTime();
  const period = getCurrentPeriod();
  
  let startHour, imageIndex;
  
  if (period === 'pagi') {
    startHour = 5;
    imageIndex = ((hour - startHour) % 6) + 1;
  } else if (period === 'siang') {
    startHour = 11;
    imageIndex = ((hour - startHour) % 4) + 1;
  } else if (period === 'sore') {
    startHour = 15;
    imageIndex = ((hour - startHour) % 3) + 1;
  } else {
    if (hour >= 18) {
      startHour = 18;
      imageIndex = ((hour - startHour) % 7) + 1;
    } else {
      startHour = 0;
      imageIndex = ((hour - startHour) % 5) + 1;
    }
  }
  
  if (imageIndex > TOTAL_IMAGES_PER_PERIOD) {
    imageIndex = ((imageIndex - 1) % TOTAL_IMAGES_PER_PERIOD) + 1;
  }
  
  return imageIndex;
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
  const { hour } = getJakartaTime();
  const period = getCurrentPeriod();
  
  if (hour === lastHour && period === lastPeriod) {
    return;
  }
  
  if (period !== lastPeriod) {
    lastPeriod = period;
    lastImageIndex = null;
    
    document.body.classList.remove('time-pagi', 'time-siang', 'time-sore', 'time-malam');
    document.body.classList.add(`time-${period}`);
  }
  
  lastHour = hour;
  const currentImageIndex = getImageIndexByHour();
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
  const { hour } = getJakartaTime();
  const nextHour = (hour + 1) % 24;
  
  const currentPeriod = getCurrentPeriod();
  let nextPeriod = currentPeriod;
  
  if (nextHour >= 5 && nextHour < 11) {
    nextPeriod = 'pagi';
  } else if (nextHour >= 11 && nextHour < 15) {
    nextPeriod = 'siang';
  } else if (nextHour >= 15 && nextHour < 18) {
    nextPeriod = 'sore';
  } else {
    nextPeriod = 'malam';
  }
  
  const currentIndex = lastImageIndex || 1;
  let nextIndex = currentIndex + 1;
  if (nextIndex > TOTAL_IMAGES_PER_PERIOD) {
    nextIndex = 1;
  }
  
  const nextImage = `img/${nextPeriod}/bg-${nextIndex}.jpg`;
  preloadImage(nextImage).catch(() => {});
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
  updateGreeting();
}, 60000);

setInterval(() => {
  preloadNextImages();
}, 3000000);

setInterval(updateDateTime, 1000);
