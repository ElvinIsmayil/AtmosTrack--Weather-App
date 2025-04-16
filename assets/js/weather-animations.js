/**
 * Weather Animations - Advanced weather animation effects and transitions
 * This file contains animation utilities for the weather app to create
 * dynamic backgrounds and interactive weather effects.
 */

// Initialize animations when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the animations system
    initAnimations();
});

/**
 * Initialize the animation system and prepare effects
 */
function initAnimations() {
    // Add parallax effect to weather cards
    initParallaxEffect();
    
    // Add microinteractions to UI elements
    addMicrointeractions();
}

/**
 * Create parallax effect for 3D depth
 */
function initParallaxEffect() {
    const weatherMain = document.querySelector('.weather-main');
    if (!weatherMain) return;
    
    // Listen for mouse movement over the main weather display
    weatherMain.addEventListener('mousemove', function(e) {
        // Get the mouse position relative to the card
        const rect = weatherMain.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation values (-5 to 5 degrees)
        const rotateY = ((x / rect.width) - 0.5) * 10;
        const rotateX = ((y / rect.height) - 0.5) * 10 * -1;
        
        // Apply the transform
        weatherMain.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Add shadow effect
        const shadowX = rotateY * 0.8;
        const shadowY = rotateX * -0.8;
        weatherMain.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.2)`;
    });
    
    // Reset on mouse leave
    weatherMain.addEventListener('mouseleave', function() {
        weatherMain.style.transform = 'rotateX(0) rotateY(0)';
        weatherMain.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        
        // Add transition for smooth reset
        weatherMain.style.transition = 'all 0.5s ease';
    });
    
    // Remove transition on mouse enter for responsive movement
    weatherMain.addEventListener('mouseenter', function() {
        weatherMain.style.transition = 'none';
    });
}

/**
 * Add microinteractions to UI elements
 */
function addMicrointeractions() {
    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.1)';
        });
        
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
        });
    });
    
    // Add reveal effects to detail cards
    const detailCards = document.querySelectorAll('.weather-detail');
    detailCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.03)';
            const icon = this.querySelector('.detail-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            const icon = this.querySelector('.detail-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });
    
    // Forecast card hover animations
    const forecastCards = document.querySelectorAll('.forecast-card');
    forecastCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.08)';
            this.style.zIndex = '10';
            const icon = this.querySelector('.forecast-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.zIndex = '1';
            const icon = this.querySelector('.forecast-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0)';
            }
        });
    });

    // Add ripple effect to buttons
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

/**
 * Create a ripple effect on button click
 */
function createRipple(event) {
    const button = event.currentTarget;
    
    // Create ripple element
    const ripple = document.createElement('span');
    
    // Get button's position
    const rect = button.getBoundingClientRect();
    
    // Calculate ripple size (larger of width or height x 2)
    const size = Math.max(rect.width, rect.height) * 2;
    
    // Calculate ripple position
    const x = event.clientX - rect.left - (size / 2);
    const y = event.clientY - rect.top - (size / 2);
    
    // Configure ripple styles
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    // Add the ripple to button
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    // Define the ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Remove the ripple after animation
    setTimeout(() => {
        ripple.remove();
        style.remove();
    }, 600);
}

/**
 * Apply swipe gesture detection for mobile interaction
 */
function enableSwipeGestures() {
    const weatherContent = document.querySelector('.weather-content');
    if (!weatherContent) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    weatherContent.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    weatherContent.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        // Detect left/right swipe
        if (touchEndX < touchStartX - 50) {
            // Swiped left - go to next section
            navigateForward();
        }
        
        if (touchEndX > touchStartX + 50) {
            // Swiped right - go to previous section
            navigateBack();
        }
    }
    
    function navigateForward() {
        // For example, transition from current weather to forecast
        const forecastSection = document.querySelector('.forecast-section');
        if (forecastSection) {
            forecastSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function navigateBack() {
        // Go back to main weather view
        const weatherDisplay = document.querySelector('.weather-display');
        if (weatherDisplay) {
            weatherDisplay.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize weather-specific animations when data is loaded
window.initWeatherBackground = function(conditionCode, isDay) {
    const weatherBg = document.getElementById('weatherBg');
    if (!weatherBg) return;
    
    // Clear existing background
    weatherBg.innerHTML = '';
    
    // Apply background gradient based on weather
    const body = document.body;
    const theme = body.getAttribute('data-theme') || 'light';
    
    // Set gradients based on weather condition and day/night
    if (isDay) {
        // Daytime gradients
        if (conditionCode >= 1000 && conditionCode < 1003) {
            // Sunny
            body.style.backgroundImage = theme === 'light' ? 
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 
                'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        } else if (conditionCode >= 1003 && conditionCode < 1030) {
            // Cloudy
            body.style.backgroundImage = theme === 'light' ? 
                'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)' : 
                'linear-gradient(135deg, #2c3e50 0%, #4c5c68 100%)';
        } else if ((conditionCode >= 1063 && conditionCode < 1070) || 
                  (conditionCode >= 1150 && conditionCode < 1201)) {
            // Rainy
            body.style.backgroundImage = theme === 'light' ? 
                'linear-gradient(135deg, #616161 0%, #9bc5c3 100%)' : 
                'linear-gradient(135deg, #232526 0%, #414345 100%)';
        } else if (conditionCode >= 1114 && conditionCode < 1150 || 
                  conditionCode >= 1210 && conditionCode < 1250) {
            // Snowy
            body.style.backgroundImage = theme === 'light' ? 
                'linear-gradient(135deg, #e6dada 0%, #274046 100%)' : 
                'linear-gradient(135deg, #243949 0%, #517fa4 100%)';
        } else if (conditionCode >= 1273 && conditionCode < 1300) {
            // Thunderstorm
            body.style.backgroundImage = theme === 'light' ? 
                'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' : 
                'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
        } else {
            // Default
            body.style.backgroundImage = theme === 'light' ? 
                'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : 
                'linear-gradient(135deg, #30cfd0 0%, #330867 100%)';
        }
    } else {
        // Nighttime gradients
        if (conditionCode >= 1000 && conditionCode < 1003) {
            // Clear night
            body.style.backgroundImage = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        } else if (conditionCode >= 1003 && conditionCode < 1030) {
            // Cloudy night
            body.style.backgroundImage = 'linear-gradient(135deg, #141e30 0%, #243b55 100%)';
        } else if ((conditionCode >= 1063 && conditionCode < 1070) || 
                  (conditionCode >= 1150 && conditionCode < 1201)) {
            // Rainy night
            body.style.backgroundImage = 'linear-gradient(135deg, #000000 0%, #434343 100%)';
        } else {
            // Default night
            body.style.backgroundImage = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        }
    }
    
    // Apply background animation
    body.style.transition = 'background-image 1.5s ease';
};

// Export functions that need to be available globally
window.applyThemeTransition = function() {
    document.body.classList.add('theme-transitioning');
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 500);
};

// Initialize animations on window load
window.addEventListener('load', function() {
    // Apply initial animations
    initAnimations();
    
    // Enable swipe gestures for mobile
    enableSwipeGestures();
    
    // Initialize AOS (Animate On Scroll) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: false
        });
    }
}); 