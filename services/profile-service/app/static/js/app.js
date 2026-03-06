// DiversIA Eternals — Alpine.js application logic

document.addEventListener('alpine:init', () => {

  // Global auth store
  Alpine.store('auth', {
    user: null,
    token: null,

    get isLoggedIn() {
      return !!this.token;
    },

    get role() {
      return this.user?.role || null;
    },

    init() {
      const saved = localStorage.getItem('diversia_auth');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.user = data.user;
          this.token = data.token;
        } catch { this.clear(); }
      }
    },

    setAuth(user, token) {
      this.user = user;
      this.token = token;
      localStorage.setItem('diversia_auth', JSON.stringify({ user, token }));
      document.cookie = `access_token=${token}; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
    },

    clear() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('diversia_auth');
      document.cookie = 'access_token=; path=/; max-age=0';
    }
  });

  // Toast notification store
  Alpine.store('toast', {
    message: '',
    type: 'success',
    visible: false,

    show(message, type = 'success') {
      this.message = message;
      this.type = type;
      this.visible = true;
      setTimeout(() => { this.visible = false; }, 4000);
    }
  });
});

// API helper
async function api(path, options = {}) {
  const token = Alpine.store('auth').token;
  const defaults = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };
  const res = await fetch(`/api/v1${path}`, { ...defaults, ...options });
  if (res.status === 401) {
    Alpine.store('auth').clear();
    window.location.href = '/login';
    return;
  }
  // Handle non-JSON responses (e.g. HTML 404 when service is down)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw { status: res.status, detail: `Service unavailable (${res.status})` };
  }
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}
