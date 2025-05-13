/**
 * Video Creator Application
 * Handles all functionality for creating animated videos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Video Creator
    const videoCreator = new VideoCreator();
    videoCreator.init();
});

class VideoCreator {
    constructor() {
        // State Management
        this.currentStep = 1;
        this.userData = {
            title: '',
            script: '',
            keyPoints: [],
            style: '',
            colorScheme: 'blue',
            customColors: {
                primary: '#3498db',
                secondary: '#2ecc71',
                accent: '#e74c3c'
            },
            animationSpeed: 'medium',
            music: 'none',
            estimatedLength: '0:00'
        };
        
        // DOM Elements
        this.elements = {};
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initFAQs();
    }
    
    cacheElements() {
        // Navigation Steps
        this.elements.steps = document.querySelectorAll('.creator-step');
        this.elements.nextButtons = document.querySelectorAll('.next-step');
        this.elements.backButtons = document.querySelectorAll('.back-step');
        
        // Step 1: Content Input
        this.elements.videoTitle = document.getElementById('video-title');
        this.elements.videoScript = document.getElementById('video-script');
        this.elements.keyPoints = document.querySelectorAll('.key-point');
        
        // Step 2: Style Selection
        this.elements.styleOptions = document.querySelectorAll('.style-option');
        
        // Step 3: Customization
        this.elements.colorScheme = document.getElementById('color-scheme');
        this.elements.customColorsDiv = document.getElementById('custom-colors');
        this.elements.primaryColor = document.getElementById('primary-color');
        this.elements.secondaryColor = document.getElementById('secondary-color');
        this.elements.accentColor = document.getElementById('accent-color');
        this.elements.animationSpeed = document.getElementById('animation-speed');
        this.elements.backgroundMusic = document.getElementById('background-music');
        this.elements.previewMusic = document.getElementById('preview-music');
        this.elements.musicPlayer = document.getElementById('music-player');
        this.elements.videoLength = document.getElementById('video-length');
        
        // Step 4: Preview & Generate
        this.elements.generatePreview = document.getElementById('generate-preview');
        this.elements.previewPlaceholder = document.getElementById('preview-placeholder');
        this.elements.previewCanvas = document.getElementById('preview-canvas');
        this.elements.summaryTitle = document.getElementById('summary-title');
        this.elements.summaryStyle = document.getElementById('summary-style');
        this.elements.summaryLength = document.getElementById('summary-length');
        this.elements.summaryMusic = document.getElementById('summary-music');
        this.elements.generateVideo = document.getElementById('generate-video');
        
        // Step 5: Download & Share
        this.elements.downloadButtons = document.querySelectorAll('.download-btn');
        this.elements.shareButtons = document.querySelectorAll('.share-btn');
        this.elements.createNewVideo = document.getElementById('create-new-video');
    }
    
    bindEvents() {
        // Navigation
        this.elements.nextButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const nextStep = e.target.dataset.next;
                if (nextStep) {
                    if (this.validateCurrentStep()) {
                        this.goToStep(nextStep);
                    }
                }
            });
        });
        
        this.elements.backButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const prevStep = e.target.dataset.prev;
                if (prevStep) {
                    this.goToStep(prevStep);
                }
            });
        });
        
        // Step 1: Content Input
        this.elements.videoTitle.addEventListener('input', this.updateVideoTitle.bind(this));
        this.elements.videoScript.addEventListener('input', this.updateVideoScript.bind(this));
        this.elements.keyPoints.forEach((keyPoint, index) => {
            keyPoint.addEventListener('input', (e) => this.updateKeyPoint(index, e.target.value));
        });
        
        // Step 2: Style Selection
        this.elements.styleOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectStyle(e.currentTarget);
            });
        });
        
        // Step 3: Customization
        this.elements.colorScheme.addEventListener('change', this.updateColorScheme.bind(this));
        this.elements.primaryColor.addEventListener('input', this.updateCustomColor.bind(this));
        this.elements.secondaryColor.addEventListener('input', this.updateCustomColor.bind(this));
        this.elements.accentColor.addEventListener('input', this.updateCustomColor.bind(this));
        this.elements.animationSpeed.addEventListener('change', this.updateAnimationSpeed.bind(this));
        this.elements.backgroundMusic.addEventListener('change', this.updateBackgroundMusic.bind(this));
        this.elements.previewMusic.addEventListener('click', this.toggleMusicPreview.bind(this));
        
        // Step 4: Preview & Generate
        this.elements.generatePreview.addEventListener('click', this.generatePreview.bind(this));
        this.elements.generateVideo.addEventListener('click', this.generateFullVideo.bind(this));
        
        // Step 5: Download & Share
        this.elements.downloadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.downloadVideo(e.target.dataset.format);
            });
        });
        
        this.elements.shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.shareVideo(e.target.dataset.platform);
            });
        });
        
        this.elements.createNewVideo.addEventListener('click', this.resetCreator.bind(this));
    }
    
    // Step Management
    goToStep(stepId) {
        this.elements.steps.forEach(step => {
            step.style.display = 'none';
        });
        
        document.getElementById(stepId).style.display = 'block';
        this.currentStep = parseInt(stepId.replace('step', ''));
        
        // Update summary if going to preview step
        if (stepId === 'step4') {
            this.updateSummary();
        }
        
        // Scroll to top of the step
        window.scrollTo({
            top: document.querySelector('.video-creator-container').offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                if (!this.userData.title) {
                    alert('Please enter a video title');
                    return false;
                }
                if (!this.userData.script) {
                    alert('Please enter a video script');
                    return false;
                }
                // Update estimated length based on script length
                this.calculateEstimatedLength();
                return true;
                
            case 2:
                if (!this.userData.style) {
                    alert('Please select a video style');
                    return false;
                }
                return true;
                
            default:
                return true;
        }
    }
    
    // Step 1: Content Input
    updateVideoTitle(e) {
        this.userData.title = e.target.value;
    }
    
    updateVideoScript(e) {
        this.userData.script = e.target.value;
    }
    
    updateKeyPoint(index, value) {
        if (!this.userData.keyPoints[index]) {
            this.userData.keyPoints[index] = '';
        }
        this.userData.keyPoints[index] = value;
    }
    
    calculateEstimatedLength() {
        // Rough estimation: 1 word = 0.5 seconds
        const wordCount = this.userData.script.split(' ').length;
        const seconds = Math.round(wordCount * 0.5);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.userData.estimatedLength = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        if (this.elements.videoLength) {
            this.elements.videoLength.textContent = this.userData.estimatedLength;
        }
    }
    
    // Step 2: Style Selection
    selectStyle(styleOption) {
        this.elements.styleOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        styleOption.classList.add('selected');
        this.userData.style = styleOption.dataset.style;
    }
    
    // Step 3: Customization
    updateColorScheme(e) {
        this.userData.colorScheme = e.target.value;
        
        if (e.target.value === 'custom') {
            this.elements.customColorsDiv.style.display = 'flex';
        } else {
            this.elements.customColorsDiv.style.display = 'none';
        }
    }
    
    updateCustomColor() {
        this.userData.customColors.primary = this.elements.primaryColor.value;
        this.userData.customColors.secondary = this.elements.secondaryColor.value;
        this.userData.customColors.accent = this.elements.accentColor.value;
    }
    
    updateAnimationSpeed(e) {
        this.userData.animationSpeed = e.target.value;
    }
    
    updateBackgroundMusic(e) {
        this.userData.music = e.target.value;
    }
    
    toggleMusicPreview() {
        if (this.userData.music === 'none') {
            alert('Please select a music track first');
            return;
        }
        
        const musicPlayer = this.elements.musicPlayer;
        
        if (musicPlayer.style.display === 'none') {
            // Set the music track based on selection
            musicPlayer.src = this.getMusicSource(this.userData.music);
            musicPlayer.style.display = 'block';
            musicPlayer.play();
        } else {
            musicPlayer.pause();
            musicPlayer.style.display = 'none';
        }
    }
    
    getMusicSource(musicType) {
        // In a real implementation, these would be paths to actual music files
        const musicMap = {
            'upbeat': 'assets/music/upbeat.mp3',
            'inspiration': 'assets/music/inspiration.mp3',
            'technology': 'assets/music/technology.mp3',
            'relaxed': 'assets/music/relaxed.mp3'
        };
        
        // For demo, return a placeholder URL
        return musicMap[musicType] || '';
    }
    
    // Step 4: Preview & Generate
    updateSummary() {
        this.elements.summaryTitle.textContent = this.userData.title;
        
        // Map style IDs to readable names
        const styleMap = {
            'explainer': 'Explainer Animation',
            'whiteboard': 'Whiteboard Animation',
            'modern': 'Modern Motion Graphics',
            'character': 'Character Animation'
        };
        this.elements.summaryStyle.textContent = styleMap[this.userData.style] || this.userData.style;
        
        this.elements.summaryLength.textContent = this.userData.estimatedLength;
        
        // Map music IDs to readable names
        const musicMap = {
            'none': 'No Background Music',
            'upbeat': 'Upbeat Corporate',
            'inspiration': 'Inspirational',
            'technology': 'Technology',
            'relaxed': 'Relaxed'
        };
        this.elements.summaryMusic.textContent = musicMap[this.userData.music] || this.userData.music;
    }
    
    generatePreview() {
        // Show loading state
        this.elements.generatePreview.textContent = 'Generating...';
        this.elements.generatePreview.disabled = true;
        
        // Simulate generation time
        setTimeout(() => {
            // Hide placeholder and show canvas
            this.elements.previewPlaceholder.style.display = 'none';
            this.elements.previewCanvas.style.display = 'block';
            
            // Draw preview on canvas
            this.drawPreview();
            
            // Reset button
            this.elements.generatePreview.textContent = 'Regenerate Preview';
            this.elements.generatePreview.disabled = false;
        }, 2000);
    }
    
    drawPreview() {
        const canvas = this.elements.previewCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Montserrat';
        ctx.textAlign = 'center';
        ctx.fillText(this.userData.title, canvas.width / 2, 50);
        
        // Draw keypoints if available
        let yPos = 100;
        this.userData.keyPoints.forEach(point => {
            if (point) {
                ctx.font = '18px Roboto';
                ctx.fillText(`• ${point}`, canvas.width / 2, yPos);
                yPos += 40;
            }
        });
        
        // Draw different preview based on selected style
        switch (this.userData.style) {
            case 'explainer':
                this.drawExplainerPreview(ctx, canvas);
                break;
            case 'whiteboard':
                this.drawWhiteboardPreview(ctx, canvas);
                break;
            case 'modern':
                this.drawModernPreview(ctx, canvas);
                break;
            case 'character':
                this.drawCharacterPreview(ctx, canvas);
                break;
            default:
                this.drawDefaultPreview(ctx, canvas);
        }
    }
    
    drawExplainerPreview(ctx, canvas) {
        // Simple shapes to represent explainer style
        ctx.fillStyle = '#3498db';
        ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);
        
        ctx.fillStyle = '#fff';
        ctx.font = '16px Roboto';
        ctx.fillText('Explainer Animation Preview', canvas.width / 2, canvas.height / 2);
    }
    
    drawWhiteboardPreview(ctx, canvas) {
        // White background with black line drawing
        ctx.fillStyle = '#fff';
        ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 - 70, 240, 140);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 80, canvas.height / 2 - 30);
        ctx.lineTo(canvas.width / 2 + 80, canvas.height / 2 - 30);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 + 20, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#000';
        ctx.font = '16px Roboto';
        ctx.fillText('Whiteboard Animation Preview', canvas.width / 2, canvas.height / 2 - 50);
    }
    
    drawModernPreview(ctx, canvas) {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#2ecc71');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 80, 300, 160);
        
        // Shapes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 50, canvas.height / 2 - 30);
        ctx.lineTo(canvas.width / 2 + 70, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 - 50, canvas.height / 2 + 30);
        ctx.closePath();
        ctx.fill();
        
        ctx.font = '16px Montserrat';
        ctx.fillText('Modern Motion Graphics Preview', canvas.width / 2, canvas.height / 2 + 70);
    }
    
    drawCharacterPreview(ctx, canvas) {
        // Simple character
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 30, 40, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#3498db';
        ctx.fillRect(canvas.width / 2 - 30, canvas.height / 2 + 20, 60, 80);
        
        ctx.fillStyle = '#fff';
        ctx.font = '16px Roboto';
        ctx.fillText('Character Animation Preview', canvas.width / 2, canvas.height / 2 + 120);
    }
    
    drawDefaultPreview(ctx, canvas) {
        ctx.fillStyle = '#fff';
        ctx.font = '18px Roboto';
        ctx.fillText('Preview not available for this style', canvas.width / 2, canvas.height / 2);
    }
    
    generateFullVideo() {
        // Show loading state
        this.elements.generateVideo.textContent = 'Generating... Please wait';
        this.elements.generateVideo.disabled = true;
        
        // Simulate video generation (would connect to a backend service in a real app)
        setTimeout(() => {
            // Go to final step
            this.goToStep('step5');
            
            // Reset button
            this.elements.generateVideo.textContent = 'Generate Full Video';
            this.elements.generateVideo.disabled = false;
        }, 5000); // Longer wait to simulate video processing
    }
    
    // Step 5: Download & Share
    downloadVideo(format) {
        // In a real app, this would download the actual generated video
        alert(`Downloading your video in ${format.toUpperCase()} format. This would normally start a file download.`);
    }
    
    shareVideo(platform) {
        switch(platform) {
            case 'youtube':
                alert('This would open YouTube upload with your video. For demo purposes, this is not implemented.');
                break;
            case 'email':
                const emailSubject = encodeURIComponent('Check out my new animated video');
                const emailBody = encodeURIComponent(`I created a new animated video called "${this.userData.title}". Check it out!`);
                window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
                break;
            default:
                alert(`Sharing to ${platform} is not implemented in this demo.`);
        }
    }
    
    resetCreator() {
        // Reset state
        this.userData = {
            title: '',
            script: '',
            keyPoints: [],
            style: '',
            colorScheme: 'blue',
            customColors: {
                primary: '#3498db',
                secondary: '#2ecc71',
                accent: '#e74c3c'
            },
            animationSpeed: 'medium',
            music: 'none',
            estimatedLength: '0:00'
        };
        
        // Reset form fields
        this.elements.videoTitle.value = '';
        this.elements.videoScript.value = '';
        this.elements.keyPoints.forEach(keyPoint => {
            keyPoint.value = '';
        });
        
        // Reset style selection
        this.elements.styleOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        // Reset customization options
        this.elements.colorScheme.value = 'blue';
        this.elements.customColorsDiv.style.display = 'none';
        this.elements.primaryColor.value = '#3498db';
        this.elements.secondaryColor.value = '#2ecc71';
        this.elements.accentColor.value = '#e74c3c';
        this.elements.animationSpeed.value = 'medium';
        this.elements.backgroundMusic.value = 'none';
        this.elements.videoLength.textContent = '0:00';
        
        // Reset preview
        this.elements.previewPlaceholder.style.display = 'block';
        this.elements.previewCanvas.style.display = 'none';
        
        // Go back to step 1
        this.goToStep('step1');
    }
    
    // FAQ Functionality
    initFAQs() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                // Toggle active class
                question.classList.toggle('active');
                
                // Update the icon
                const icon = question.querySelector('.faq-toggle i');
                if (question.classList.contains('active')) {
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                } else {
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                }
            });
        });
    }
}

// Helper function to scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
} 