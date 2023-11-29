
export function toggleChristmasLights(enable: boolean) {
    if (enable) {
        addChristmasLights();
    } else {
        removeChristmasLights();
    }
}

// Define a function to add Christmas lights
export function addChristmasLights() {
    // Create a container for lights
    const lightsContainer: HTMLDivElement = document.createElement('div');
    lightsContainer.id = 'christmas-lights-container';
    document.body.prepend(lightsContainer);

    // Array of colors for the lights
    const colors: string[] = ['red-light', 'green-light', 'blue-light', 'yellow-light'];

    // Calculate the number of lights based on the viewport width
    const numberOfLights: number = Math.floor(window.innerWidth / 30); // Adjust 30 based on light size + margin

    // Add lights to the container with different colors and random blink delays
    for (let i = 0; i < numberOfLights; i++) {
        const light: HTMLDivElement = document.createElement('div');
        light.className = 'christmas-light ' + colors[i % colors.length];

        // Set a random animation delay for each light to blink at different times
        const blinkDelay: number = Math.random() * 5; // up to 5 seconds delay
        light.style.animationDelay = `${blinkDelay}s`;

        lightsContainer.appendChild(light);
    }

    createSnowflakes();
    addHats();
    
}

// Function to remove Christmas lights
function removeChristmasLights() {
    const lightsContainer = document.getElementById('christmas-lights-container');
    if (lightsContainer) {
        lightsContainer.remove();
    }

    const santaHat = document.getElementById('santa-hat');
    if (santaHat) {
        santaHat.remove();
    }

    while (document.getElementsByClassName('snowflake').length > 0) {
        document.getElementsByClassName('snowflake')[0].remove();
    }

    // remove santa hats
    while (document.getElementById('santa-hat')) {
        document.getElementById('santa-hat')!.remove();
    }
}

function createSnowflakes() {
    const numberOfSnowflakes = 50; // Adjust the number of snowflakes here

    for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Randomize size and animation duration
        const size = Math.random() * 5 + 2; // Size between 2px and 7px
        const duration = Math.random() * 5 + 5; // Duration between 5s and 10s

        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.setProperty('--random-left', Math.random().toString()); // Random horizontal start

        document.body.appendChild(snowflake);
    }
}

function findElementByXPath(xpath: any) {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  }

  function addSantaHatToElement(element: any, offsetRight: number = 0) {
    if (!element) return;
  
    const santaHatImg = document.createElement('img');
    santaHatImg.id = 'santa-hat';
    santaHatImg.src = chrome.runtime.getURL('santa_hat_smaller.png');
    santaHatImg.style.position = 'absolute';
    santaHatImg.style.top = '-10px';
    santaHatImg.style.right = offsetRight + 'px';
    santaHatImg.style.width = 'auto'; // Adjust size as needed
    santaHatImg.style.height = 'auto';
    santaHatImg.style.zIndex = '1000';
  
    element.style.position = 'relative';
    element.appendChild(santaHatImg);
  }

  function addHats(){
    const xpath = '/html/body/div[2]/div/div/div/div/div[2]/div/div/div[1]/div[1]/div[1]/div/button/div'
    const element = findElementByXPath(xpath);
    addSantaHatToElement(element, 10);

    const xpath2 = '/html/body/div[2]/div/div/div/div/div[2]/div/nav/div[3]/button/div/div/div/div/div/div/div[1]'
    const element2 = findElementByXPath(xpath2);
    addSantaHatToElement(element2);

    const xpath3 = '/html/body/div[2]/div/div/div/div/div[2]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/a[2]/div/div'
    const element3 = findElementByXPath(xpath3);
    addSantaHatToElement(element3);
  }