// Theme switcher functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check if theme preference is stored in localStorage
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for dark mode
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for light mode
    }
    
    // Toggle theme when the button is clicked
    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
}

// Custom device management functionality
class CustomDeviceManager {
    constructor() {
        this.devices = [];
        this.currentStep = 1;
        this.selectionStart = { x: 0, y: 0 };
        this.selectionEnd = { x: 0, y: 0 };
        this.isSelecting = false;
        this.currentDeviceImage = null;
        this.screenCoordinates = null;
        // New simple approach using container percentages
        this.screenPercentages = null;
        
        // Load saved devices from localStorage
        this.loadDevices();
    }
    
    // Load custom devices from localStorage
    loadDevices() {
        const savedDevices = localStorage.getItem('customDevices');
        if (savedDevices) {
            this.devices = JSON.parse(savedDevices);
        }
    }
    
    // Save custom devices to localStorage
    saveDevices() {
        localStorage.setItem('customDevices', JSON.stringify(this.devices));
    }
    
    // Add a new custom device with improved screen positioning
    addDevice(device) {
        // Generate a unique ID
        device.id = 'custom-' + Date.now();
        
        // Make sure to include screenPercentages if available
        if (this.screenPercentages) {
            device.screenPercentages = this.screenPercentages;
        }
        
        this.devices.push(device);
        this.saveDevices();
        return device;
    }
    
    // Remove a custom device by ID
    removeDevice(deviceId) {
        this.devices = this.devices.filter(device => device.id !== deviceId);
        this.saveDevices();
    }
    
    // Get all custom devices
    getAllDevices() {
        return this.devices;
    }
    
    // Reset the selection process
    resetSelection() {
        this.selectionStart = { x: 0, y: 0 };
        this.selectionEnd = { x: 0, y: 0 };
        this.isSelecting = false;
        this.screenCoordinates = null;
        // Also reset the new screenPercentages property
        this.screenPercentages = null;
        
        // Hide the selection area element
        const selectionArea = document.getElementById('selection-area');
        if (selectionArea) {
            selectionArea.classList.add('hidden');
            selectionArea.style.top = '0px';
            selectionArea.style.left = '0px';
            selectionArea.style.width = '0px';
            selectionArea.style.height = '0px';
        }
    }
    
    // Move to the next step in the custom device wizard
    nextStep() {
        const currentStepElem = document.getElementById(`step-${this.currentStep}`);
        currentStepElem.classList.remove('active');
        
        this.currentStep++;
        
        const nextStepElem = document.getElementById(`step-${this.currentStep}`);
        nextStepElem.classList.add('active');
        
        // Update navigation buttons
        this.updateStepControls();
    }
    
    // Move to the previous step in the custom device wizard
    prevStep() {
        const currentStepElem = document.getElementById(`step-${this.currentStep}`);
        currentStepElem.classList.remove('active');
        
        this.currentStep--;
        
        const prevStepElem = document.getElementById(`step-${this.currentStep}`);
        prevStepElem.classList.add('active');
        
        // Update navigation buttons
        this.updateStepControls();
    }
    
    // Update the step control buttons based on current step
    updateStepControls() {
        const prevStepBtn = document.getElementById('prev-step');
        const nextStepBtn = document.getElementById('next-step');
        const saveDeviceBtn = document.getElementById('save-custom-device');
        
        // Handle prev button
        if (this.currentStep > 1) {
            prevStepBtn.disabled = false;
        } else {
            prevStepBtn.disabled = true;
        }
        
        // Handle next/save buttons
        if (this.currentStep === 3) {
            nextStepBtn.classList.add('hidden');
            saveDeviceBtn.classList.remove('hidden');
        } else {
            nextStepBtn.classList.remove('hidden');
            saveDeviceBtn.classList.add('hidden');
            
            // Enable/disable next button based on step completion
            if (this.currentStep === 1) {
                nextStepBtn.disabled = !this.currentDeviceImage;
            } else if (this.currentStep === 2) {
                nextStepBtn.disabled = !this.screenCoordinates;
            }
        }
    }
    
    // Reset the entire custom device creation process
    resetCustomDeviceCreation() {
        this.currentStep = 1;
        this.currentDeviceImage = null;
        this.resetSelection();
        
        // Reset form elements
        const deviceImagePreview = document.getElementById('device-preview');
        deviceImagePreview.src = '';
        
        const deviceNameInput = document.getElementById('custom-device-name');
        deviceNameInput.value = '';
        
        // Reset step display
        for (let i = 1; i <= 3; i++) {
            const stepElem = document.getElementById(`step-${i}`);
            if (i === 1) {
                stepElem.classList.add('active');
            } else {
                stepElem.classList.remove('active');
            }
        }
        
        this.updateStepControls();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme switcher
    initTheme();
    
    // Initialize custom device manager
    const customDeviceManager = new CustomDeviceManager();
    
    // DOM Elements
    const imageUpload = document.getElementById('image-upload');
    let previewImage = document.getElementById('preview-image'); // Using let instead of const since we might reassign this
    const mockupDisplay = document.getElementById('mockup-display');
    const downloadBtn = document.getElementById('download-btn');
    const removeBtn = document.getElementById('remove-btn');
    const deviceButtons = document.querySelectorAll('.device-btn');
    const placeholderText = document.querySelector('.placeholder-text');
    const previewContainer = document.querySelector('.preview-container');
    
    // Store selected image source to use when updating device display
    let selectedImageSrc = null;
    const borderToggleCheckbox = document.getElementById('border-toggle');
    
    // Custom device elements
    const addCustomDeviceBtn = document.getElementById('add-custom-device-btn');
    const customDeviceModal = document.getElementById('custom-device-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const deviceImageUpload = document.getElementById('device-image-upload');
    const devicePreview = document.getElementById('device-preview');
    const selectionArea = document.getElementById('selection-area');
    const deviceCanvasContainer = document.getElementById('device-canvas-container');
    const resetSelectionBtn = document.getElementById('reset-selection');
    const prevStepBtn = document.getElementById('prev-step');
    const nextStepBtn = document.getElementById('next-step');
    const saveCustomDeviceBtn = document.getElementById('save-custom-device');
    const deviceNameInput = document.getElementById('custom-device-name');
    const deviceButtonsContainer = document.getElementById('device-buttons');
    const customDeviceButtonsContainer = document.getElementById('custom-device-buttons');
    
    // Tab elements
    const devicesTab = document.getElementById('devices-tab');
    const customDevicesTab = document.getElementById('custom-devices-tab');
    const devicesPanel = document.getElementById('devices-panel');
    const customDevicesPanel = document.getElementById('custom-devices-panel');
    const noCustomDevicesMessage = document.querySelector('.no-custom-devices-message');
    
    // Border toggle container
    const borderToggle = document.querySelector('.border-toggle');
    
    // Background gradient elements
    const backgroundToggleCheckbox = document.getElementById('background-toggle');
    const gradientOptions = document.getElementById('gradient-options');
    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');
    const magicGradientBtn = document.getElementById('magic-gradient-btn');
    
    // Title elements
    const titleToggleCheckbox = document.getElementById('title-toggle');
    const titleOptions = document.getElementById('title-options');
    const mockupTitleInput = document.getElementById('mockup-title');
    const titleSizeInput = document.getElementById('title-size');
    const titleSizeValue = document.getElementById('title-size-value');
    const titleColorInput = document.getElementById('title-color');
    const titleDisplay = document.getElementById('title-display');
    const titleText = document.getElementById('title-text');
    
    // Canvas size elements
    const canvasPresets = document.querySelectorAll('.canvas-preset');
    const canvasDimensionsDisplay = document.getElementById('canvas-dimensions-display');
    
    // Predefined beautiful gradients
    const gradientPresets = [
        { color1: '#4158D0', color2: '#C850C0' },
        { color1: '#0093E9', color2: '#80D0C7' },
        { color1: '#8EC5FC', color2: '#E0C3FC' },
        { color1: '#D9AFD9', color2: '#97D9E1' },
        { color1: '#FBAB7E', color2: '#F7CE68' },
        { color1: '#85FFBD', color2: '#FFFB7D' },
        { color1: '#FF9A8B', color2: '#FF6A88' },
        { color1: '#FFDEE9', color2: '#B5FFFC' },
        { color1: '#43CBFF', color2: '#9708CC' },
        { color1: '#FA8BFF', color2: '#2BD2FF' },
    ];
    
    // Current selected device
    let currentDevice = 'iphone';
    
    // Function to switch between device tabs
    function switchDeviceTab(tabName) {
        // Update tab buttons
        if (tabName === 'devices') {
            devicesTab.classList.add('active');
            customDevicesTab.classList.remove('active');
            devicesPanel.classList.add('active');
            customDevicesPanel.classList.remove('active');
            // Show border toggle when standard devices are selected
            borderToggle.style.display = 'block';
        } else {
            devicesTab.classList.remove('active');
            customDevicesTab.classList.add('active');
            devicesPanel.classList.remove('active');
            customDevicesPanel.classList.add('active');
            // Hide border toggle when custom devices are selected
            borderToggle.style.display = 'none';
        }
    }

    // Function to render all custom device buttons
    function renderCustomDevices() {
        // Clear the custom device buttons container
        customDeviceButtonsContainer.innerHTML = '';
        
        // Get all custom devices
        const devices = customDeviceManager.getAllDevices();
        
        // Show/hide no custom devices message
        if (devices.length === 0) {
            noCustomDevicesMessage.style.display = 'block';
        } else {
            noCustomDevicesMessage.style.display = 'none';
            
            // Add buttons for each custom device
            devices.forEach(device => {
                // Create the wrapper for the device item
                const deviceItem = document.createElement('div');
                deviceItem.className = 'custom-device-item';
                deviceItem.dataset.id = device.id;
                
                // Create the device button
                const customDeviceBtn = document.createElement('button');
                customDeviceBtn.className = 'device-btn custom-device';
                customDeviceBtn.dataset.device = device.id;
                customDeviceBtn.innerHTML = `<i class="fas fa-mobile-alt"></i> ${device.name}`;
                
                // Create the delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'device-delete-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.title = 'Delete this custom device';
                
                // Add delete functionality
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering the device button click
                    if (confirm(`Are you sure you want to delete "${device.name}"?`)) {
                        customDeviceManager.removeDevice(device.id);
                        renderCustomDevices();
                        
                        // If current device is the one being deleted, switch to iPhone
                        if (currentDevice === device.id) {
                            // Switch to devices tab
                            switchDeviceTab('devices');
                            
                            // Select iPhone device
                            currentDevice = 'iphone';
                            updateDeviceDisplay('iphone');
                            
                            // Activate the iPhone button
                            document.querySelector('button[data-device="iphone"]').classList.add('active');
                        }
                    }
                });
                
                // Add click event to select this device
                customDeviceBtn.addEventListener('click', () => {
                    // Remove active class from all buttons
                    document.querySelectorAll('.device-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Add active class to clicked button
                    customDeviceBtn.classList.add('active');
                    
                    // Update current device
                    currentDevice = device.id;
                    
                    // Create custom device element
                    updateDeviceDisplay(device);
                });
                
                // Add to the container
                deviceItem.appendChild(customDeviceBtn);
                deviceItem.appendChild(deleteBtn);
                customDeviceButtonsContainer.appendChild(deviceItem);
            });
        }
    }
    
    // Initialize custom device buttons from stored devices
    renderCustomDevices();
    
    // Set up tab switching functionality
    devicesTab.addEventListener('click', () => switchDeviceTab('devices'));
    customDevicesTab.addEventListener('click', () => switchDeviceTab('custom'));
    
    // Initialize with the devices tab active
    switchDeviceTab('devices');
    
    // Function to update device display (works with both built-in and custom devices)
    function updateDeviceDisplay(deviceData) {
        // Check if this is a builtin device or custom device
        if (typeof deviceData === 'string') {
            // Builtin device (string ID)
            const hasWhiteBorder = mockupDisplay.classList.contains('white-border');
            mockupDisplay.className = deviceData;
            if (hasWhiteBorder) {
                mockupDisplay.classList.add('white-border');
            }
            
            // Reset inline styles that might have been set for custom devices
            mockupDisplay.style.backgroundImage = '';
            mockupDisplay.style.backgroundSize = '';
            mockupDisplay.style.backgroundRepeat = '';
            mockupDisplay.style.backgroundPosition = '';
            mockupDisplay.style.width = '';
            mockupDisplay.style.height = '';
            
            // Reset screen element styles
            const screen = mockupDisplay.querySelector('.screen');
            screen.style.position = '';
            screen.style.top = '';
            screen.style.left = '';
            screen.style.width = '';
            screen.style.height = '';
        } else {
            // Custom device (object)
            const hasWhiteBorder = mockupDisplay.classList.contains('white-border');
            
            // Clear existing classes and set to custom
            mockupDisplay.className = 'custom-device';
            
            // Load the device image with proper dimensions
            const deviceImg = new Image();
            deviceImg.src = deviceData.imageUrl;
            deviceImg.onload = () => {
                // Get the natural dimensions of the image
                const imgNaturalWidth = deviceImg.naturalWidth;
                const imgNaturalHeight = deviceImg.naturalHeight;
                
                // Determine appropriate display size while maintaining aspect ratio
                const maxWidth = 400; // Maximum width for display
                const maxHeight = 600; // Maximum height for display
                
                let displayWidth, displayHeight;
                
                // Calculate display dimensions (maintain aspect ratio)
                if (imgNaturalWidth > imgNaturalHeight) {
                    // Landscape orientation
                    displayWidth = Math.min(maxWidth, imgNaturalWidth);
                    displayHeight = (imgNaturalHeight / imgNaturalWidth) * displayWidth;
                } else {
                    // Portrait orientation
                    displayHeight = Math.min(maxHeight, imgNaturalHeight);
                    displayWidth = (imgNaturalWidth / imgNaturalHeight) * displayHeight;
                }
                
                // Apply the custom device styles
                mockupDisplay.style.backgroundImage = `url(${deviceData.imageUrl})`;
                mockupDisplay.style.backgroundSize = 'contain';
                mockupDisplay.style.backgroundRepeat = 'no-repeat';
                mockupDisplay.style.backgroundPosition = 'center';
                mockupDisplay.style.width = `${displayWidth}px`;
                mockupDisplay.style.height = `${displayHeight}px`;
                
                // IMPORTANT: Position the screen by getting exact measurements of the current display
                setTimeout(() => {
                    // Get the screen element but don't completely reset styles
                    // This was causing issues with positioning
                    const screen = mockupDisplay.querySelector('.screen');
                    
                    // Instead of removing all styles, we'll explicitly set the ones we need
                    // Keep existing position and size if set, otherwise initialize
                    
                    // First apply all critical styles to ensure proper positioning
                    screen.style.position = 'absolute';
                    screen.style.margin = '0';
                    screen.style.padding = '0';
                    screen.style.transform = 'none';
                    screen.style.borderRadius = '0';
                    screen.style.display = 'flex';
                    screen.style.alignItems = 'center';
                    screen.style.justifyContent = 'center';
                    screen.style.backgroundColor = '#f8f8f8';
                    
                    // CRITICAL FIX: Get the REAL dimensions of the mock display as rendered in the DOM
                    const mockupRect = mockupDisplay.getBoundingClientRect();
                    
                    // Get background image dimensions from the actual computed style
                    const computedStyle = window.getComputedStyle(mockupDisplay);
                    const bgImage = new Image();
                    let bgUrl = computedStyle.backgroundImage;
                    
                    // Extract the URL from the backgroundImage string (format: url("..."))
                    bgUrl = bgUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                    
                    // Get the natural device image dimensions
                    const naturalWidth = deviceData.width || deviceData.imageWidth;
                    const naturalHeight = deviceData.height || deviceData.imageHeight;
                    
                    console.log('Device dimensions:', mockupRect.width, mockupRect.height);
                    console.log('Natural dimensions:', naturalWidth, naturalHeight);
                    
                    // Create a temporary div to help with exact positioning
                    const tempDiv = document.createElement('div');
                    tempDiv.style.position = 'absolute';
                    tempDiv.style.top = '0';
                    tempDiv.style.left = '0';
                    tempDiv.style.width = '100%';
                    tempDiv.style.height = '100%';
                    tempDiv.style.backgroundImage = `url(${bgUrl})`;
                    tempDiv.style.backgroundSize = 'contain';
                    tempDiv.style.backgroundRepeat = 'no-repeat';
                    tempDiv.style.backgroundPosition = 'center';
                    tempDiv.style.pointerEvents = 'none';
                    
                    mockupDisplay.appendChild(tempDiv);
                    
                    // Force layout calculation
                    void tempDiv.offsetWidth;
                    
                    // Get the actual rendered background image dimensions and position
                    // We'll use a timeout to ensure the background is rendered
                    setTimeout(() => {
                        // Remove temp div after measurements
                        mockupDisplay.removeChild(tempDiv);
                        
                        // Calculate the scale ratio between the original image and current display
                        const scaleX = mockupRect.width / naturalWidth;
                        const scaleY = mockupRect.height / naturalHeight;
                        
                        // First check if we have the new screenPercentages property
                        if (deviceData.screenPercentages) {
                            // Calculate background image dimensions and position
                            // This is crucial for correct positioning
                            const bgImage = new Image();
                            bgImage.src = deviceData.imageUrl;
                            
                            // Calculate the aspect ratios
                            const deviceAspectRatio = deviceData.imageWidth / deviceData.imageHeight;
                            const mockupAspectRatio = mockupRect.width / mockupRect.height;
                            
                            // Determine the actual rendered size of the background image
                            // when it's set to 'contain' within the mockup display
                            let bgWidth, bgHeight;
                            if (deviceAspectRatio > mockupAspectRatio) {
                                // Width is constrained
                                bgWidth = mockupRect.width;
                                bgHeight = mockupRect.width / deviceAspectRatio;
                            } else {
                                // Height is constrained
                                bgHeight = mockupRect.height;
                                bgWidth = mockupRect.height * deviceAspectRatio;
                            }
                            
                            // Calculate the actual scale factor between the original image and how it's rendered
                            const scaleFactorX = bgWidth / deviceData.imageWidth;
                            const scaleFactorY = bgHeight / deviceData.imageHeight;
                            
                            // Calculate the position adjustments for centering
                            const leftOffset = (mockupRect.width - bgWidth) / 2;
                            const topOffset = (mockupRect.height - bgHeight) / 2;
                            
                            // Critical fix: Calculate the screen position directly from the exact pixels where drawn
                            // This ensures the screen appears exactly where the rectangle was drawn
                            // First get the background image's exact rendered dimensions
                            const deviceImageAspectRatio = deviceData.imageWidth / deviceData.imageHeight;
                            let renderedBgWidth, renderedBgHeight;
                            
                            if (deviceImageAspectRatio > mockupAspectRatio) {
                                // Width constrained
                                renderedBgWidth = mockupRect.width;
                                renderedBgHeight = mockupRect.width / deviceImageAspectRatio;
                            } else {
                                // Height constrained
                                renderedBgHeight = mockupRect.height;
                                renderedBgWidth = mockupRect.height * deviceImageAspectRatio;
                            }
                            
                            // Scale factor between original device image and current rendered size
                            const exactScaleX = renderedBgWidth / deviceData.imageWidth;
                            const exactScaleY = renderedBgHeight / deviceData.imageHeight;
                            
                            // Calculate position exactly matching the preview when rectangle was drawn
                            // Using the exact proportions from the original image and ensuring precise alignment
                            
                            // SUPER SIMPLE APPROACH: Use direct percentages
                            // Get the current mockup dimensions
                            const mockupWidth = mockupRect.width;
                            const mockupHeight = mockupRect.height;
                            
                            // Directly apply screen coordinates as percentages of the mockup size
                            // This is the simplest possible approach - use percentages consistently
                            const left = mockupRect.width * deviceData.screenPercentages.x;
                            const top = mockupRect.height * deviceData.screenPercentages.y;
                            const width = mockupRect.width * deviceData.screenPercentages.width;
                            const height = mockupRect.height * deviceData.screenPercentages.height;
                            
                            console.log('Simple percentage positioning:', {
                                mockupWidth,
                                mockupHeight,
                                screenX: deviceData.screenPercentages.x,
                                screenY: deviceData.screenPercentages.y,
                                screenWidth: deviceData.screenPercentages.width,
                                screenHeight: deviceData.screenPercentages.height,
                                resultLeft: left,
                                resultTop: top,
                                resultWidth: width,
                                resultHeight: height
                            });
                            
                            // Apply a correction factor if needed to ensure perfect alignment
                            // This helps account for any browser rendering inconsistencies
                            
                            console.log('Screen position and size:', { left, top, width, height });
                            console.log('Scale factors:', { scaleFactorX, scaleFactorY });
                            console.log('Offsets:', { leftOffset, topOffset });
                            
                            // Apply exact dimensions with high precision
                            // Force integer pixel values to avoid any subpixel rendering inconsistencies
                            screen.style.left = `${Math.round(left)}px`;
                            screen.style.top = `${Math.round(top)}px`;
                            screen.style.width = `${Math.round(width)}px`;
                            screen.style.height = `${Math.round(height)}px`;
                            
                            // Set transform-origin to ensure any transformations maintain correct position
                            screen.style.transformOrigin = 'top left';
                            
                            // Log the exact screen position for debugging
                            console.log('Applied screen position:', {
                                left: `${Math.round(left * 100) / 100}px`,
                                top: `${Math.round(top * 100) / 100}px`,
                                width: `${Math.round(width * 100) / 100}px`,
                                height: `${Math.round(height * 100) / 100}px`
                            });
                            
                            // Make sure any content inside fits perfectly
                            const screenImage = screen.querySelector('img');
                            if (screenImage) {
                                screenImage.style.position = 'absolute';
                                screenImage.style.top = '0';
                                screenImage.style.left = '0';
                                screenImage.style.width = '100%';
                                screenImage.style.height = '100%';
                                screenImage.style.objectFit = 'cover'; // Use cover to fill by default, but don't crop when repositioning
                                screenImage.style.margin = '0';
                                screenImage.style.padding = '0';
                                screenImage.style.border = 'none';
                                
                                // Ensure the parent screen element allows the image to extend beyond its boundaries
                                // This is crucial for iPhone devices which were showing white space
                                screen.style.overflow = 'visible';
                                
                                // Force exact positioning to ensure accurate placement
                                screen.style.position = 'absolute';
                                screen.style.boxSizing = 'border-box';
                                screen.style.margin = '0';
                                screen.style.padding = '0';
                            }
                            
                            console.log('Using percentage coordinates:', left, top, width, height);
                        } else if (deviceData.screenCoordinates) {
                            // For older devices - use direct scaling of the original coordinates
                            // Check which coordinate format we have
                            if (deviceData.screenCoordinates.left !== undefined) {
                                const left = deviceData.screenCoordinates.left * scaleX;
                                const top = deviceData.screenCoordinates.top * scaleY;
                                const width = deviceData.screenCoordinates.width * scaleX;
                                const height = deviceData.screenCoordinates.height * scaleY;
                                
                                // Apply exact dimensions
                                screen.style.left = `${left}px`;
                                screen.style.top = `${top}px`;
                                screen.style.width = `${width}px`;
                                screen.style.height = `${height}px`;
                            } else {
                                // Assume we have x,y,width,height format
                                const left = deviceData.screenCoordinates.x * scaleX;
                                const top = deviceData.screenCoordinates.y * scaleY;
                                const width = deviceData.screenCoordinates.width * scaleX;
                                const height = deviceData.screenCoordinates.height * scaleY;
                                
                                // Apply dimensions
                                screen.style.left = `${left}px`;
                                screen.style.top = `${top}px`;
                                screen.style.width = `${width}px`;
                                screen.style.height = `${height}px`;
                            }
                        } else {
                            // No valid coordinates found - use a fallback approach
                            console.warn('No valid screen coordinates found for custom device');
                            
                            // Center the screen and use 80% of the container size
                            const fallbackWidth = mockupRect.width * 0.8;
                            const fallbackHeight = mockupRect.height * 0.6; 
                            const fallbackLeft = (mockupRect.width - fallbackWidth) / 2;
                            const fallbackTop = (mockupRect.height - fallbackHeight) / 2;
                            
                            screen.style.left = `${fallbackLeft}px`;
                            screen.style.top = `${fallbackTop}px`;
                            screen.style.width = `${fallbackWidth}px`;
                            screen.style.height = `${fallbackHeight}px`;
                            
                            // Make sure any content inside fits perfectly
                            const screenImage = screen.querySelector('img');
                            if (screenImage) {
                                screenImage.style.position = 'absolute';
                                screenImage.style.top = '0';
                                screenImage.style.left = '0';
                                screenImage.style.width = '100%';
                                screenImage.style.height = '100%';
                                screenImage.style.objectFit = 'cover'; // Use cover to fill by default, but don't crop when repositioning
                                screenImage.style.margin = '0';
                                screenImage.style.padding = '0';
                                screenImage.style.border = 'none';
                                
                                // Ensure the parent screen element allows the image to extend beyond its boundaries
                                // This is crucial for iPhone devices which were showing white space
                                screen.style.overflow = 'visible';
                                
                                // Force exact positioning to ensure accurate placement
                                screen.style.position = 'absolute';
                                screen.style.boxSizing = 'border-box';
                                screen.style.margin = '0';
                                screen.style.padding = '0';
                            }
                            
                            console.log('Using scaled coordinates:', left, top, width, height);
                        }
                    }, 10);
                    
                }, 50); // Small delay to ensure styles are applied
                
                if (hasWhiteBorder) {
                    mockupDisplay.classList.add('white-border');
                }
            };
            
            // In case the image is already loaded or cached
            if (deviceImg.complete) {
                deviceImg.onload();
            }
        }
    }
    
    // Function to display image in mockup
    function displayImage(imageSource) {
        // Store the image source for later reference
        selectedImageSrc = imageSource;
        
        // Clear any previous content in the screen area
        const screen = mockupDisplay.querySelector('.screen');
        
        // Always ensure overflow is visible for draggable images
        screen.style.overflow = 'visible';
        screen.style.position = 'absolute'; // Ensure position is absolute for proper placement
        
        // Custom device handling - make sure we don't reset the screen position for custom devices
        // This is needed to keep the screen where it was selected during the custom device creation
        if (currentDevice && currentDevice.startsWith('custom-')) {
            // Don't reset screen position for custom devices
            console.log('Maintaining custom device screen position');
        }
        
        if (screen) {
            // Clear previous content
            screen.innerHTML = '';
            
            // Create a new image element to be contained within the screen
            const screenImg = document.createElement('img');
            screenImg.src = imageSource;
            screenImg.id = 'preview-image';
            screenImg.alt = 'Preview';
            
            // First, let's get the real dimensions of the uploaded image
            const tempImg = new Image();
            tempImg.onload = function() {
                const imgWidth = this.width;
                const imgHeight = this.height;
                const imgAspectRatio = imgWidth / imgHeight;
                
                // Get the screen dimensions
                const screenWidth = screen.offsetWidth;
                const screenHeight = screen.offsetHeight;
                const screenAspectRatio = screenWidth / screenHeight;
                
                // Calculate the best fit positioning
                screenImg.style.position = 'absolute';
                
                // Position the image to fill the mockup by default
                screenImg.style.width = '100%';
                screenImg.style.height = '100%';
                screenImg.style.top = '0';
                screenImg.style.left = '0';
                screenImg.style.objectFit = 'cover'; // Use 'cover' to fill the mockup by default
                screenImg.style.cursor = 'move'; // Show move cursor to indicate draggable
                screenImg.style.transformOrigin = 'center'; // Better transform behavior
                
                // Track the current mode (fill or fit)
                screenImg.dataset.mode = 'fill';
                
                screenImg.style.display = 'block';
                
                // Make the image draggable for repositioning
                let isDragging = false;
                let currentX;
                let currentY;
                let initialX;
                let initialY;
                let xOffset = 0;
                let yOffset = 0;
                
                // Set overflow visible to always show the entire image
                // This is crucial for allowing users to see and position the entire image
                screen.style.overflow = 'visible';
                
                // Ensure the image can extend beyond its container
                screenImg.style.maxWidth = 'none';
                screenImg.style.maxHeight = 'none';
                screenImg.style.zIndex = '999'; // Keep image on top during dragging
                
                // Event listeners for drag functionality
                screenImg.addEventListener('mousedown', dragStart);
                screenImg.addEventListener('touchstart', dragStart, { passive: false });
                
                document.addEventListener('mouseup', dragEnd);
                document.addEventListener('touchend', dragEnd);
                
                document.addEventListener('mousemove', drag);
                document.addEventListener('touchmove', drag, { passive: false });
                
                // Add double-click event to toggle between fill and fit modes
                screenImg.addEventListener('dblclick', toggleDisplayMode);
                
                function dragStart(e) {
                    if (e.type === 'touchstart') {
                        initialX = e.touches[0].clientX - xOffset;
                        initialY = e.touches[0].clientY - yOffset;
                    } else {
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }
                    
                    if (e.target === screenImg) {
                        isDragging = true;
                    }
                    
                    e.preventDefault();
                }
                
                function dragEnd(e) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;
                    
                    // Reset opacity back to full when dragging ends
                    screenImg.style.opacity = '1';
                }
                
                function drag(e) {
                    if (isDragging) {
                        e.preventDefault();
                        
                        if (e.type === 'touchmove') {
                            currentX = e.touches[0].clientX - initialX;
                            currentY = e.touches[0].clientY - initialY;
                        } else {
                            currentX = e.clientX - initialX;
                            currentY = e.clientY - initialY;
                        }
                        
                        xOffset = currentX;
                        yOffset = currentY;
                        
                        // Apply the position change
                        setTranslate(currentX, currentY, screenImg);
                        
                        // Add visual feedback during dragging in any mode
                        screenImg.style.opacity = '0.9'; // Slightly transparent while dragging
                        
                        // Ensure the parent container allows the image to extend beyond its boundaries
                        // This prevents cropping during drag operations
                        const parentScreen = screenImg.closest('.screen');
                        if (parentScreen) {
                            parentScreen.style.overflow = 'visible';
                        }
                    }
                }
                
                function setTranslate(xPos, yPos, el) {
                    // Use transform for smooth performance but ensure the image isn't clipped
                    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
                    
                    // Ensure the parent container allows the image to extend beyond its boundaries
                    const parentScreen = el.closest('.screen');
                    if (parentScreen) {
                        parentScreen.style.overflow = 'visible';
                        
                        // Also ensure any parent containers allow overflow
                        let parent = parentScreen.parentElement;
                        while (parent && parent !== document.body) {
                            if (parent.classList.contains('mockup-display') || 
                                parent.classList.contains('device-container')) {
                                parent.style.overflow = 'visible';
                            }
                            parent = parent.parentElement;
                        }
                    }
                    
                    // Make sure the image itself doesn't clip its content
                    el.style.maxWidth = 'none';
                    el.style.maxHeight = 'none';
                    el.style.willChange = 'transform'; // Performance optimization for transforms
                }
                
                // Function to toggle between fill and fit modes on double-click
                function toggleDisplayMode(e) {
                    e.preventDefault();
                    
                    // Toggle between 'cover' (fill) and 'contain' (fit) modes
                    if (screenImg.dataset.mode === 'fill') {
                        // Change to fit mode - show full image
                        screenImg.style.objectFit = 'contain';
                        screenImg.dataset.mode = 'fit';
                        
                        // Always allow the image to be positioned freely without cropping
                        screen.style.overflow = 'visible';
                    } else {
                        // Change to fill mode - fill the entire screen
                        screenImg.style.objectFit = 'cover';
                        screenImg.dataset.mode = 'fill';
                        
                        // Still keep overflow visible in fill mode to prevent cropping when repositioning
                        screen.style.overflow = 'visible';
                    }
                    
                    // Reset position when changing modes
                    xOffset = 0;
                    yOffset = 0;
                    screenImg.style.transform = 'translate3d(0px, 0px, 0)';
                }
                console.log('Positioned image: ', screenImg.style.top, screenImg.style.left, screenImg.style.width, screenImg.style.height);
            };
            tempImg.src = imageSource;
            
            // Add the image to the screen
            screen.appendChild(screenImg);
            
            // Update reference to the preview image
            previewImage = screenImg;
        } else {
            // Fallback for legacy code if .screen element isn't found
            previewImage.src = imageSource;
            previewImage.style.display = 'block';
        }
        
        // Hide placeholder and enable download button
        placeholderText.style.display = 'none';
        downloadBtn.disabled = false;
        removeBtn.classList.remove('hidden');
        
        // Add animation class
        previewImage.classList.add('fadeIn');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            previewImage.classList.remove('fadeIn');
        }, 500);
    }
    
    // Function to reset the preview
    function resetPreview() {
        selectedImageSrc = null;
        
        // Clear content from screen area
        const screen = mockupDisplay.querySelector('.screen');
        if (screen) {
            screen.innerHTML = '';
        }
        
        // Reset the original preview image if it exists
        const origPreviewImage = document.getElementById('preview-image');
        if (origPreviewImage) {
            origPreviewImage.src = '';
            origPreviewImage.style.display = 'none';
        }
        
        // Reset previewImage reference to original element
        previewImage = document.getElementById('preview-image');
        
        // Show placeholder and disable buttons
        placeholderText.style.display = 'block';
        downloadBtn.disabled = true;
        removeBtn.classList.add('hidden');
    }
    
    // Handle image upload via file input
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => displayImage(event.target.result);
            reader.readAsDataURL(file);
        }
    });
    
    // Handle device selection
    deviceButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.device-btn').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update current device
            currentDevice = button.dataset.device;
            
            // Update mockup display
            updateDeviceDisplay(currentDevice);
        });
    });
    
    // Handle custom device modal
    addCustomDeviceBtn.addEventListener('click', () => {
        customDeviceModal.classList.remove('hidden');
        customDeviceManager.resetCustomDeviceCreation();
    });
    
    closeModalBtn.addEventListener('click', () => {
        customDeviceModal.classList.add('hidden');
    });
    
    // Handle device image upload
    deviceImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                devicePreview.src = event.target.result;
                customDeviceManager.currentDeviceImage = event.target.result;
                nextStepBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle screen area selection
    deviceCanvasContainer.addEventListener('mousedown', (e) => {
        if (!customDeviceManager.currentDeviceImage) return;
        
        // Prevent default browser behavior which might cause image dragging
        e.preventDefault();
        
        // Get dimensions and positions with high precision
        const containerRect = deviceCanvasContainer.getBoundingClientRect();
        const imageRect = devicePreview.getBoundingClientRect();
        
        // Calculate the offsets for proper positioning
        const imageOffsetLeft = imageRect.left - containerRect.left;
        const imageOffsetTop = imageRect.top - containerRect.top;
        
        // Calculate click position relative to the container
        const clickX = e.clientX - containerRect.left;
        const clickY = e.clientY - containerRect.top;
        
        // Only start selection if the click is inside the image
        if (clickX >= imageOffsetLeft && 
            clickX <= imageOffsetLeft + imageRect.width && 
            clickY >= imageOffsetTop && 
            clickY <= imageOffsetTop + imageRect.height) {
            
            // Store the selection start position relative to the container with high precision
            customDeviceManager.selectionStart = { 
                x: Math.round(clickX * 100) / 100, 
                y: Math.round(clickY * 100) / 100 
            };
            
            // Calculate position as a percentage of the image dimensions with high precision
            // This is critical for accurate positioning later
            customDeviceManager.selectionStartPercent = {
                x: Math.round(((clickX - imageOffsetLeft) / imageRect.width) * 10000) / 10000,
                y: Math.round(((clickY - imageOffsetTop) / imageRect.height) * 10000) / 10000
            };
            
            // Also store actual pixel coordinates relative to the image with high precision
            customDeviceManager.selectionStartPixels = {
                x: Math.round((clickX - imageOffsetLeft) * 100) / 100,
                y: Math.round((clickY - imageOffsetTop) * 100) / 100
            };
            
            // Store image's natural dimensions for accurate scaling
            customDeviceManager.deviceImageNaturalWidth = devicePreview.naturalWidth;
            customDeviceManager.deviceImageNaturalHeight = devicePreview.naturalHeight;
            
            // Store the current image's rendered dimensions for reference
            customDeviceManager.deviceImageRenderedWidth = imageRect.width;
            customDeviceManager.deviceImageRenderedHeight = imageRect.height;
            
            customDeviceManager.isSelecting = true;
            
            // Show selection area at the click position with exact positioning
            selectionArea.classList.remove('hidden');
            selectionArea.style.top = `${customDeviceManager.selectionStart.y}px`;
            selectionArea.style.left = `${customDeviceManager.selectionStart.x}px`;
            selectionArea.style.width = '0px';
            selectionArea.style.height = '0px';
            
            console.log('Selection started at:', 
                      'Container coordinates:', customDeviceManager.selectionStart.x, customDeviceManager.selectionStart.y,
                      'Image coordinates:', customDeviceManager.selectionStartPixels.x, customDeviceManager.selectionStartPixels.y,
                      'Percentage:', customDeviceManager.selectionStartPercent.x, customDeviceManager.selectionStartPercent.y);
        }
    });
    
    deviceCanvasContainer.addEventListener('mousemove', (e) => {
        if (!customDeviceManager.isSelecting) return;
        
        // Prevent default browser behavior during selection
        e.preventDefault();
        
        // Get container and image dimensions with high precision
        const containerRect = deviceCanvasContainer.getBoundingClientRect();
        const imageRect = devicePreview.getBoundingClientRect();
        
        // Get cursor position relative to the container with high precision
        customDeviceManager.selectionEnd = { 
            x: Math.round((e.clientX - containerRect.left) * 100) / 100, 
            y: Math.round((e.clientY - containerRect.top) * 100) / 100 
        };
        
        // Calculate the end position relative to the image
        // Get the offset of the image relative to the container
        const imageOffsetLeft = imageRect.left - containerRect.left;
        const imageOffsetTop = imageRect.top - containerRect.top;
        
        // Calculate position as a percentage of the image dimensions with high precision
        // This is critical for accurate positioning later
        customDeviceManager.selectionEndPercent = {
            x: Math.round(((customDeviceManager.selectionEnd.x - imageOffsetLeft) / imageRect.width) * 10000) / 10000,
            y: Math.round(((customDeviceManager.selectionEnd.y - imageOffsetTop) / imageRect.height) * 10000) / 10000
        };
        
        // Also store actual pixel coordinates relative to the image with high precision
        customDeviceManager.selectionEndPixels = {
            x: Math.round((customDeviceManager.selectionEnd.x - imageOffsetLeft) * 100) / 100,
            y: Math.round((customDeviceManager.selectionEnd.y - imageOffsetTop) * 100) / 100
        };
        
        // Calculate dimensions for the selection box with high precision
        const top = Math.round(Math.min(customDeviceManager.selectionStart.y, customDeviceManager.selectionEnd.y) * 100) / 100;
        const left = Math.round(Math.min(customDeviceManager.selectionStart.x, customDeviceManager.selectionEnd.x) * 100) / 100;
        const width = Math.round(Math.abs(customDeviceManager.selectionEnd.x - customDeviceManager.selectionStart.x) * 100) / 100;
        const height = Math.round(Math.abs(customDeviceManager.selectionEnd.y - customDeviceManager.selectionStart.y) * 100) / 100;
        
        // Update selection area with exact positioning
        selectionArea.style.top = `${top}px`;
        selectionArea.style.left = `${left}px`;
        selectionArea.style.width = `${width}px`;
        selectionArea.style.height = `${height}px`;
        
        // Add a distinctive border to make the selection more visible
        selectionArea.style.border = '2px dashed #007bff';
        selectionArea.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
    });
    
    deviceCanvasContainer.addEventListener('mouseup', () => {
        if (customDeviceManager.isSelecting) {
            customDeviceManager.isSelecting = false;
            
            // Get container and image dimensions with high precision
            const containerRect = deviceCanvasContainer.getBoundingClientRect();
            const imageRect = devicePreview.getBoundingClientRect();
            
            // Calculate dimensions in pixels with high precision
            const top = Math.round(Math.min(customDeviceManager.selectionStart.y, customDeviceManager.selectionEnd.y) * 100) / 100;
            const left = Math.round(Math.min(customDeviceManager.selectionStart.x, customDeviceManager.selectionEnd.x) * 100) / 100;
            const width = Math.round(Math.abs(customDeviceManager.selectionEnd.x - customDeviceManager.selectionStart.x) * 100) / 100;
            const height = Math.round(Math.abs(customDeviceManager.selectionEnd.y - customDeviceManager.selectionStart.y) * 100) / 100;
            
            // Calculate percentage values relative to the image size with high precision
            // These exact percentages are critical - they define where the rectangle was drawn
            const startPercentX = Math.round(Math.min(customDeviceManager.selectionStartPercent.x, customDeviceManager.selectionEndPercent.x) * 10000) / 10000;
            const startPercentY = Math.round(Math.min(customDeviceManager.selectionStartPercent.y, customDeviceManager.selectionEndPercent.y) * 10000) / 10000;
            const widthPercent = Math.round(Math.abs(customDeviceManager.selectionEndPercent.x - customDeviceManager.selectionStartPercent.x) * 10000) / 10000;
            const heightPercent = Math.round(Math.abs(customDeviceManager.selectionEndPercent.y - customDeviceManager.selectionStartPercent.y) * 10000) / 10000;
            
            // Log selected percentages for debugging
            console.log('Selected area percentages:', {
                x: startPercentX,
                y: startPercentY,
                width: widthPercent,
                height: heightPercent
            });
            
            // Calculate the image offset for exact positioning with high precision
            const imageOffsetLeft = Math.round((imageRect.left - containerRect.left) * 100) / 100;
            const imageOffsetTop = Math.round((imageRect.top - containerRect.top) * 100) / 100;
            
            // Add visual feedback to show the selection is complete
            selectionArea.style.border = '2px solid #28a745';
            selectionArea.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            
            // SUPER SIMPLE APPROACH - Store direct percentages of the CONTAINER
            // This is the simplest approach - just use direct percentages of the entire mockup
            // No need for complex calculations about image fitting
            
            // Get container dimensions for calculating percentages
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;
            
            // Calculate direct percentages of container (not image)
            // Use different variable names to avoid redeclaration errors
            const containerXPercent = left / containerWidth;
            const containerYPercent = top / containerHeight;
            const containerWidthPercent = width / containerWidth;
            const containerHeightPercent = height / containerHeight;
            
            // Store only these four simple percentage values
            customDeviceManager.screenPercentages = {
                x: containerXPercent,
                y: containerYPercent, 
                width: containerWidthPercent,
                height: containerHeightPercent
            };
            
            // Log for debugging
            console.log('SIMPLE PERCENTAGES stored:', {
                containerWidth,
                containerHeight,
                selectionLeft: left,
                selectionTop: top,
                selectionWidth: width,
                selectionHeight: height,
                x: containerXPercent,
                y: containerYPercent,
                width: containerWidthPercent,
                height: containerHeightPercent
            });
            
            // Only log the new simple percentages approach
            console.log('Screen percentages saved:', customDeviceManager.screenPercentages);
            
            // Enable next button
            nextStepBtn.disabled = false;
        }
    });
    
    // Handle reset selection button
    resetSelectionBtn.addEventListener('click', () => {
        customDeviceManager.resetSelection();
        nextStepBtn.disabled = true;
    });
    
    // Handle step navigation
    prevStepBtn.addEventListener('click', () => {
        customDeviceManager.prevStep();
    });
    
    nextStepBtn.addEventListener('click', () => {
        customDeviceManager.nextStep();
    });
    
    // Handle save custom device
    saveCustomDeviceBtn.addEventListener('click', () => {
        const deviceName = deviceNameInput.value.trim();
        
        if (!deviceName) {
            alert('Please enter a name for your device.');
            return;
        }
        
        if (!customDeviceManager.currentDeviceImage || (!customDeviceManager.screenPercentages && !customDeviceManager.screenCoordinates)) {
            alert('Missing image or screen area selection.');
            return;
        }
        
        // Create new custom device - need to properly get image dimensions
        const deviceImg = new Image();
        deviceImg.src = customDeviceManager.currentDeviceImage;
        
        // We need to wait for the image to load to get its dimensions
        deviceImg.onload = () => {
            // Store all necessary data using the new simplified screenPercentages
            const newDevice = {
                name: deviceName,
                imageUrl: customDeviceManager.currentDeviceImage,
                width: deviceImg.naturalWidth,
                height: deviceImg.naturalHeight,
                // Use the new screenPercentages property for positioning
                screenPercentages: customDeviceManager.screenPercentages,
                // Keep screenCoordinates for backward compatibility
                screenCoordinates: customDeviceManager.screenCoordinates,
                imageWidth: deviceImg.naturalWidth,
                imageHeight: deviceImg.naturalHeight
            };
            
            console.log('Created custom device with percentages:', newDevice.screenPercentages);
            
            // Add device and update UI
            const addedDevice = customDeviceManager.addDevice(newDevice);
            renderCustomDevices();
            
            // Close modal
            customDeviceModal.classList.add('hidden');
            
            // Switch to custom devices tab
            switchDeviceTab('custom');
            
            // Select the newly added device
            const customDeviceBtn = document.querySelector(`button[data-device="${addedDevice.id}"]`);
            if (customDeviceBtn) {
                customDeviceBtn.click();
            }
            
            // Show success message
            alert(`Custom device "${deviceName}" has been added!`);
        };
        
        // The adding logic has been moved inside the image.onload callback
    });
    
    // Handle download
    downloadBtn.addEventListener('click', async () => {
        if (previewImage.src) {
            try {
                // Change button text to loading state
                const originalBtnText = downloadBtn.innerHTML;
                downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
                downloadBtn.disabled = true;
                
                // Wait a moment for the UI to update
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Create a container for capturing with gradient if needed
                const captureContainer = document.createElement('div');
                captureContainer.style.position = 'relative';
                captureContainer.style.width = `${currentCanvasWidth}px`;
                captureContainer.style.height = `${currentCanvasHeight}px`;
                captureContainer.style.display = 'flex';
                captureContainer.style.justifyContent = 'center';
                captureContainer.style.alignItems = 'center';
                
                // If gradient is active, add it to the capture container
                if (previewContainer.classList.contains('with-gradient')) {
                    captureContainer.style.background = getComputedStyle(document.documentElement)
                        .getPropertyValue('--gradient-background');
                }
                
                // Clone the mockup display for the capture
                const mockupClone = mockupDisplay.cloneNode(true);
                mockupClone.style.position = 'relative';
                mockupClone.style.zIndex = '1';
                
                // Ensure all screen elements in the clone have overflow visible
                const clonedScreens = mockupClone.querySelectorAll('.screen');
                clonedScreens.forEach(screen => {
                    screen.style.overflow = 'visible !important';
                });
                
                captureContainer.appendChild(mockupClone);
                
                // Temporarily add to document but hide it
                captureContainer.style.position = 'absolute';
                captureContainer.style.left = '-9999px';
                document.body.appendChild(captureContainer);
                
                // Use html2canvas to capture the mockup with background
                const canvas = await html2canvas(captureContainer, {
                    backgroundColor: null,
                    scale: 2, // Higher resolution
                    logging: false,
                    allowTaint: true,
                    useCORS: true,
                    onclone: function(clonedDoc) {
                        // Ensure all screens in the cloned document have overflow visible
                        const allScreens = clonedDoc.querySelectorAll('.screen');
                        allScreens.forEach(screen => {
                            screen.style.overflow = 'visible !important';
                        });
                        
                        // Also ensure any parent containers allow overflow
                        const containers = clonedDoc.querySelectorAll('.mockup-display, .device-container');
                        containers.forEach(container => {
                            container.style.overflow = 'visible';
                        });
                    }
                });
                
                // Remove the temporary container
                document.body.removeChild(captureContainer);
                
                // Create download link
                const link = document.createElement('a');
                link.download = `${currentDevice}-mockup.png`;
                link.href = canvas.toDataURL('image/png');
                
                // Trigger download
                link.click();
                
                // Reset button state
                downloadBtn.innerHTML = originalBtnText;
                downloadBtn.disabled = false;
                
            } catch (error) {
                console.error('Error generating mockup:', error);
                alert('Failed to generate mockup. Please try again.');
                downloadBtn.innerHTML = originalBtnText;
                downloadBtn.disabled = false;
            }
        }
    });
    
    // Drag and drop functionality - limited to preview container only
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        previewContainer.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight effect for preview container
    ['dragenter', 'dragover'].forEach(eventName => {
        previewContainer.addEventListener(eventName, () => {
            previewContainer.classList.add('highlight');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        previewContainer.addEventListener(eventName, () => {
            previewContainer.classList.remove('highlight');
        }, false);
    });
    
    // Handle drop on the preview container only
    previewContainer.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                displayImage(event.target.result);
                // Scroll to the preview if it's not in view
                previewContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Handle remove image button
    removeBtn.addEventListener('click', () => {
        resetPreview();
    });
    
    // Handle border color toggle
    borderToggleCheckbox.addEventListener('change', () => {
        if (borderToggleCheckbox.checked) {
            // White border (toggle ON)
            mockupDisplay.classList.add('white-border');
        } else {
            // Dark border (toggle OFF)
            mockupDisplay.classList.remove('white-border');
        }
    });
    
    // Function to update gradient background
    function updateGradient() {
        const color1 = color1Input.value;
        const color2 = color2Input.value;
        document.documentElement.style.setProperty('--gradient-color-1', color1);
        document.documentElement.style.setProperty('--gradient-color-2', color2);
        document.documentElement.style.setProperty(
            '--gradient-background', 
            `linear-gradient(135deg, ${color1}, ${color2})`
        );
    }
    
    // Handle background toggle
    backgroundToggleCheckbox.addEventListener('change', () => {
        if (backgroundToggleCheckbox.checked) {
            // Gradient background (toggle ON)
            gradientOptions.classList.remove('hidden');
            previewContainer.classList.add('with-gradient');
            updateGradient();
        } else {
            // No background (toggle OFF)
            gradientOptions.classList.add('hidden');
            previewContainer.classList.remove('with-gradient');
        }
    });
    
    // Handle magic gradient button click
    magicGradientBtn.addEventListener('click', () => {
        // Generate random gradient colors
        const randomColor1 = '#' + Math.floor(Math.random()*16777215).toString(16);
        const randomColor2 = '#' + Math.floor(Math.random()*16777215).toString(16);
        
        // Update color inputs
        color1Input.value = randomColor1;
        color2Input.value = randomColor2;
        
        // Update gradient
        updateGradient();
        
        // Ensure gradient is active
        if (!backgroundToggleCheckbox.checked) {
            backgroundToggleCheckbox.checked = true;
            // Trigger the change event to update UI
            const event = new Event('change');
            backgroundToggleCheckbox.dispatchEvent(event);
        }
    });
    
    // Handle color picker changes
    color1Input.addEventListener('input', updateGradient);
    color2Input.addEventListener('input', updateGradient);
    
    // Magic gradient button - select a random preset
    magicGradientBtn.addEventListener('click', () => {
        const randomPreset = gradientPresets[Math.floor(Math.random() * gradientPresets.length)];
        color1Input.value = randomPreset.color1;
        color2Input.value = randomPreset.color2;
        updateGradient();
    });
    
    // ------- Title Feature Implementation -------
    
    // Toggle title options visibility
    titleToggleCheckbox.addEventListener('change', () => {
        if (titleToggleCheckbox.checked) {
            titleOptions.classList.remove('hidden');
            titleDisplay.classList.remove('hidden');
            updateTitleDisplay();
        } else {
            titleOptions.classList.add('hidden');
            titleDisplay.classList.add('hidden');
        }
    });
    
    // Update title text when input changes
    mockupTitleInput.addEventListener('input', updateTitleDisplay);
    
    // Update title size when slider changes
    titleSizeInput.addEventListener('input', () => {
        titleSizeValue.textContent = `${titleSizeInput.value}px`;
        updateTitleDisplay();
    });
    
    // Update title color when color picker changes
    titleColorInput.addEventListener('input', updateTitleDisplay);
    
    // Add layer position option to title options
    const titleLayerOptions = document.createElement('div');
    titleLayerOptions.className = 'title-layer-options';
    titleLayerOptions.innerHTML = `
        <div class="title-layer-control">
            <label>Layer Position:</label>
            <div class="layer-buttons">
                <button id="title-layer-front" class="layer-btn active" title="Show title in front of device">
                    <i class="fas fa-layer-group"></i> Front
                </button>
                <button id="title-layer-back" class="layer-btn" title="Show title behind device">
                    <i class="fas fa-layer-group fa-flip-vertical"></i> Behind
                </button>
            </div>
        </div>
    `;
    titleOptions.appendChild(titleLayerOptions);
    
    // Get layer buttons
    const titleLayerFrontBtn = document.getElementById('title-layer-front');
    const titleLayerBackBtn = document.getElementById('title-layer-back');
    
    // Layer position control
    titleLayerFrontBtn.addEventListener('click', () => {
        titleLayerFrontBtn.classList.add('active');
        titleLayerBackBtn.classList.remove('active');
        titleDisplay.style.zIndex = '10'; // Above the device
    });
    
    titleLayerBackBtn.addEventListener('click', () => {
        titleLayerBackBtn.classList.add('active');
        titleLayerFrontBtn.classList.remove('active');
        titleDisplay.style.zIndex = '1'; // Behind the device
    });
    
    // Function to update the title display
    function updateTitleDisplay() {
        const titleValue = mockupTitleInput.value || 'Your Title Here';
        const titleSize = titleSizeInput.value;
        const titleColor = titleColorInput.value;
        
        titleText.textContent = titleValue;
        titleText.style.fontSize = `${titleSize}px`;
        titleText.style.color = titleColor;
    }
    
    // Make the title container draggable using the move icon
    const titleContainer = document.getElementById('title-container');
    const titleMoveIcon = document.getElementById('title-move-icon');
    let isDraggingTitle = false;
    let titleOffsetX = 0;
    let titleOffsetY = 0;
    
    titleMoveIcon.addEventListener('mousedown', (e) => {
        isDraggingTitle = true;
        
        // Calculate the mouse offset from the container's position
        const containerRect = titleContainer.getBoundingClientRect();
        titleOffsetX = e.clientX - containerRect.left;
        titleOffsetY = e.clientY - containerRect.top;
        
        // Add a class for styling during drag
        titleContainer.classList.add('dragging');
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDraggingTitle) return;
        
        // Get mockup wrapper dimensions
        const wrapperRect = document.querySelector('.mockup-wrapper').getBoundingClientRect();
        
        // Calculate new position relative to the mockup wrapper
        const left = ((e.clientX - wrapperRect.left) / wrapperRect.width) * 100;
        const top = ((e.clientY - wrapperRect.top) / wrapperRect.height) * 100;
        
        // Update container position in percentages for responsiveness
        titleContainer.style.left = `${left}%`;
        titleContainer.style.top = `${top}%`;
        titleContainer.style.transform = 'translateX(-50%)'; // Keep horizontal centering
    });
    
    document.addEventListener('mouseup', () => {
        if (isDraggingTitle) {
            isDraggingTitle = false;
            titleContainer.classList.remove('dragging');
        }
    });
    
    // Update html2canvas capture to include the title
    const originalDownloadBtnClick = downloadBtn.onclick;
    downloadBtn.onclick = null;
    
    downloadBtn.addEventListener('click', async () => {
        if (previewImage.src) {
            try {
                // Change button text to loading state
                const originalBtnText = downloadBtn.innerHTML;
                downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
                downloadBtn.disabled = true;
                
                // Wait a moment for the UI to update
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Create a container for capturing with all elements
                const captureContainer = document.createElement('div');
                captureContainer.style.position = 'relative';
                captureContainer.style.width = `${mockupDisplay.offsetWidth}px`;
                captureContainer.style.height = `${mockupDisplay.offsetHeight}px`;
                
                // If gradient is active, add it to the capture container
                if (previewContainer.classList.contains('with-gradient')) {
                    captureContainer.style.background = getComputedStyle(document.documentElement)
                        .getPropertyValue('--gradient-background');
                }
                
                // Include the title if it's visible
                if (!titleDisplay.classList.contains('hidden')) {
                    const titleClone = titleText.cloneNode(true);
                    titleClone.style.position = 'absolute';
                    titleClone.style.zIndex = '1'; // Behind the device
                    captureContainer.appendChild(titleClone);
                }
                
                // Clone the mockup display for the capture
                const mockupClone = mockupDisplay.cloneNode(true);
                mockupClone.style.position = 'relative';
                mockupClone.style.zIndex = '2';
                captureContainer.appendChild(mockupClone);
                
                // Append the container to the body temporarily
                document.body.appendChild(captureContainer);
                
                // Generate the image
                const canvas = await html2canvas(captureContainer, {
                    backgroundColor: null,
                    scale: 2, // Higher resolution
                    allowTaint: true,
                    useCORS: true,
                    onclone: function(clonedDoc) {
                        // Ensure all screens in the cloned document have overflow visible
                        const allScreens = clonedDoc.querySelectorAll('.screen');
                        allScreens.forEach(screen => {
                            screen.style.overflow = 'visible !important';
                        });
                        
                        // Also ensure any parent containers allow overflow
                        const containers = clonedDoc.querySelectorAll('.mockup-display, .device-container');
                        containers.forEach(container => {
                            container.style.overflow = 'visible';
                        });
                    }
                });
                
                // Remove the temporary container
                document.body.removeChild(captureContainer);
                
                // Create download link
                const link = document.createElement('a');
                link.download = `${currentDevice}-mockup.png`;
                link.href = canvas.toDataURL('image/png');
                
                // Trigger download
                link.click();
                
                // Reset button state
                downloadBtn.innerHTML = originalBtnText;
                downloadBtn.disabled = false;
                
            } catch (error) {
                console.error('Error generating mockup:', error);
                alert('Failed to generate mockup. Please try again.');
                downloadBtn.innerHTML = originalBtnText;
                downloadBtn.disabled = false;
            }
        }
    }, { once: false });
    
    // Canvas size preset functionality
    let currentCanvasWidth = 1200;
    let currentCanvasHeight = 675;
    
    // Initialize canvas size
    updateCanvasSize(currentCanvasWidth, currentCanvasHeight);
    
    // Add event listeners to canvas presets
    canvasPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            // Remove active class from all presets
            canvasPresets.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked preset
            preset.classList.add('active');
            
            // Get dimensions from data attributes
            const width = parseInt(preset.getAttribute('data-width'));
            const height = parseInt(preset.getAttribute('data-height'));
            
            // Update canvas size
            currentCanvasWidth = width;
            currentCanvasHeight = height;
            updateCanvasSize(width, height);
        });
    });
    
    // Function to update canvas size
    function updateCanvasSize(width, height) {
        const mockupWrapper = document.querySelector('.mockup-wrapper');
        const previewContainer = document.querySelector('.preview-container');
        
        // Calculate available space within the preview container (accounting for padding)
        const containerWidth = previewContainer.clientWidth - 80; // Subtracting padding
        const containerHeight = previewContainer.clientHeight - 80; // Subtracting padding
        
        // Calculate maximum possible dimensions while maintaining aspect ratio
        let scale = Math.min(
            containerWidth / width,
            containerHeight / height
        );
        
        // Apply a max scale of 1 to avoid enlarging beyond native size
        scale = Math.min(scale, 1);
        
        // Set the mockup wrapper dimensions - original dimensions for correct aspect ratio
        mockupWrapper.style.width = `${width}px`;
        mockupWrapper.style.height = `${height}px`;
        
        // Set transform scale (without affecting the centering transform)
        mockupWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        // Update dimensions display
        canvasDimensionsDisplay.textContent = `${width} × ${height} px`;
    }
    
    // Handle window resize to maintain proper scaling
    window.addEventListener('resize', () => {
        updateCanvasSize(currentCanvasWidth, currentCanvasHeight);
    });
});

