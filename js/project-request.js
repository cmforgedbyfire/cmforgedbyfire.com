(function () {
  'use strict';

  var ENDPOINT = 'https://api.cmforgedbyfire.com/project-requests';
  var form = document.getElementById('projectRequestForm');
  var category = document.getElementById('projectCategory');
  var submit = document.getElementById('projectRequestSubmit');
  var status = document.getElementById('projectRequestStatus');
  if (!form || !category || !submit || !status) return;

  function setStatus(message, state) {
    status.textContent = message;
    status.className = 'request-status' + (state ? ' is-' + state : '');
  }

  function updateConditionalFields() {
    var selected = category.value;
    document.querySelectorAll('.request-conditional').forEach(function (field) {
      var categories = (field.getAttribute('data-category') || '').split(' ');
      field.hidden = !selected || categories.indexOf(selected) === -1;
    });
  }

  function payloadFromForm() {
    var data = new FormData(form);
    return {
      name: data.get('name') || '', email: data.get('email') || '', company: data.get('company') || '',
      contactMethod: data.get('contactMethod') || 'Email', projectCategory: data.get('projectCategory') || '',
      projectStage: data.get('projectStage') || '', softwarePlatform: data.get('softwarePlatform') || '',
      appPlatform: data.get('appPlatform') || '', websiteType: data.get('websiteType') || '', aiFocus: data.get('aiFocus') || '',
      audience: data.get('audience') || '', projectGoal: data.get('projectGoal') || '', mustHaveFeatures: data.get('mustHaveFeatures') || '',
      integrations: data.get('integrations') || '', budget: data.get('budget') || '', timeline: data.get('timeline') || '',
      existingUrl: data.get('existingUrl') || '', additionalDetails: data.get('additionalDetails') || '',
      consent: data.get('consent') === 'on', website: data.get('website') || ''
    };
  }

  category.addEventListener('change', updateConditionalFields);
  updateConditionalFields();

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    setStatus('', '');
    if (!form.reportValidity()) return;

    submit.disabled = true;
    submit.textContent = 'Sending…';
    setStatus('Sending your request securely…', 'working');
    try {
      var response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadFromForm())
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || !result.ok) throw new Error(result.error || 'The request could not be delivered.');
      form.reset();
      updateConditionalFields();
      setStatus('Your request was sent to Forged By Fire for individual review. Reference: ' + result.reference + '. Submitting a request does not guarantee acceptance.', 'success');
    } catch (error) {
      setStatus((error.message || 'The request could not be delivered.') + ' Please try again later or use the Support page.', 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send project request';
    }
  });
}());
