// Form loading state handler for services.html
(() => {
  const form = document.getElementById('serviceForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      submitButton.style.opacity = '0.6';
      submitButton.style.cursor = 'not-allowed';
    }
    
    // Add a spinner or loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'form-loading';
    loadingIndicator.textContent = 'Processing your request...';
    loadingIndicator.style.cssText = `
      margin-top: 16px;
      padding: 12px;
      background: rgba(255, 122, 24, 0.1);
      border: 1px solid rgba(255, 122, 24, 0.3);
      border-radius: 8px;
      text-align: center;
      color: #ff7a18;
    `;
    form.appendChild(loadingIndicator);
  });
})();
