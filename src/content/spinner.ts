function showSpinner(parentSelector: string) {
  const loadingSpinner = document.querySelector('.ghuibooster__spinner');
  if (loadingSpinner) {
    loadingSpinner.classList.remove('ghuibooster__hidden');
    return;
  }
  injectCSS();
  createSpinner(parentSelector);
}

function injectCSS() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
      .ghuibooster__spinner.ghuibooster__hidden {
          display: none;
      }
      .ghuibooster__spinner {
        border: 2px solid #f3f3f3;
        border-top: 2px solid #0d1318;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        animation: ghuibooster__spin .7s linear infinite;
        display: inline-block;
        vertical-align: text-bottom;
        margin-left: 1rem;
      }
      @keyframes ghuibooster__spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
  document.getElementsByTagName('head')[0].appendChild(style);
}

function createSpinner(parentSelector: string) {
  const parentEl = document.querySelector(parentSelector);
  const loadingSpinner = document.createElement('div');
  loadingSpinner.classList.add('ghuibooster__spinner');
  parentEl?.appendChild(loadingSpinner);
  return loadingSpinner;
}

function hideSpinner() {
  const loadingOverlay = document.querySelector('.ghuibooster__spinner');
  loadingOverlay?.classList.add('ghuibooster__hidden');
}

export const Spinner = {
  showSpinner,
  hideSpinner,
};
