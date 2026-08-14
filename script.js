document.addEventListener('DOMContentLoaded', async () => {
  const currentYear = new Date().getFullYear();
  const copyright = document.querySelector('.copyright');

  if (copyright) {
    copyright.textContent = `© ${currentYear} Starcast Media. All rights reserved.`;
  }

  const authForm = document.getElementById('auth-form');
  const signupBtn = document.getElementById('signup-btn');
  const authStatus = document.getElementById('auth-status');
  const authMessage = document.getElementById('auth-message');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');

  const setMessage = (message, type = '') => {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`.trim();
  };

  const updateAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      if (data.authenticated && data.user) {
        authStatus.textContent = 'Signed in';
        authStatus.style.borderColor = 'rgba(167, 242, 199, 0.6)';
        authStatus.style.color = '#a7f2c7';
        emailInput.value = data.user.email;
        emailInput.disabled = true;
        passwordInput.value = '';
      } else {
        authStatus.textContent = 'Signed out';
        authStatus.style.borderColor = 'var(--line)';
        authStatus.style.color = 'var(--muted)';
        emailInput.disabled = false;
      }
    } catch (error) {
      console.error('Status check failed', error);
    }
  };

  const submitAuth = async (mode) => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      setMessage('Please enter your email and password.', 'error');
      return;
    }

    setMessage('Working...', '');

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Authentication failed.', 'error');
        return;
      }

      setMessage(data.message || 'Success!', 'success');
      await updateAuthStatus();
      passwordInput.value = '';
    } catch (error) {
      setMessage('Could not connect to the auth API.', 'error');
    }
  };

  if (authForm) {
    authForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await submitAuth('login');
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
      await submitAuth('signup');
    });
  }

  await updateAuthStatus();
});
