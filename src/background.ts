import * as SpeechCommands from '@tensorflow-models/speech-commands';

console.log('In background.ts:');
console.log('SpeechCommmands version:',  SpeechCommands.version);

(async function main() {
  const recognizer = SpeechCommands.create('BROWSER_FFT');
  recognizer.ensureModelLoaded().then(() => {
    console.log('ensureModelLoaded() DONE');
    const wordLabels = recognizer.wordLabels();
    recognizer.listen(async results => {
      let maxIndex = 0;
      let max: number = -Infinity;
      const scores = results.scores as Float32Array;
      for (let i = 0; i < scores.length; ++i) {
        if (scores[i] > max) {
          max = scores[i];
          maxIndex = i;
        }
      }
      console.log('Detected word:', wordLabels[maxIndex]);
      chrome.tabs.create({url: `http://${wordLabels[maxIndex]}.com`});
      chrome.browserAction.setBadgeText({text: wordLabels[maxIndex]});
    }, {
      includeSpectrogram: true,
      probabilityThreshold: 0.9
    });
  });
})();
