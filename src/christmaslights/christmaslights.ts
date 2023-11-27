// Define a function to add Christmas lights
export function addChristmasLights() {
    // Create a container for lights
    const lightsContainer: HTMLDivElement = document.createElement('div');
    lightsContainer.id = 'christmas-lights-container';
    document.body.prepend(lightsContainer);
  
    // Array of colors for the lights
    const colors: string[] = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink'];
  
    // Calculate the number of lights based on the viewport width
    const numberOfLights: number = Math.floor(window.innerWidth / 30); // Adjust 30 based on light size + margin
  
    // Add lights to the container with different colors and random blink delays
    for (let i = 0; i < numberOfLights; i++) {
      const light: HTMLDivElement = document.createElement('div');
      light.className = 'christmas-light';
  
      // Set a random color for each light
      const colorIndex: number = Math.floor(Math.random() * colors.length);
      const color: string = colors[colorIndex];
      light.style.backgroundColor = color;
  
      // Set a random animation delay for each light to blink at different times
      const blinkDelay: number = Math.random() * 5; // up to 5 seconds delay
      light.style.animationDelay = `${blinkDelay}s`;
  
      lightsContainer.appendChild(light);
    }
  
  }
