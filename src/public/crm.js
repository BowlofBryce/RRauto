(function () {
  'use strict';

  const token = sessionStorage.getItem('crm_token');
  const businessId = sessionStorage.getItem('crm_business_id');

  window.CRM = {
    token,
    businessId,

    guardAuth() {
      if (!token || !businessId) {
        window.location.href = '/login';
      }
    },

    apiHeaders() {
      return {
        'Authorization': 'Bearer ' + token,
        'x-business-id': businessId,
        'Content-Type': 'application/json',
      };
    },

    async api(path, opts) {
      opts = opts || {};
      const res = await fetch(path, {
        ...opts,
        headers: Object.assign({}, this.apiHeaders(), opts.headers || {}),
      });
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || e.detail || 'Request failed');
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },

    toast(msg, type) {
      let container = document.getElementById('crm-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'crm-toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      const el = document.createElement('div');
      el.className = 'toast' + (type ? ' toast-' + type : '');
      el.textContent = msg;
      container.appendChild(el);
      setTimeout(() => el.remove(), 3200);
    },

    formatDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    formatDateShort(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    formatCurrency(n) {
      if (n == null || n === '') return '—';
      return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },

    initials(name) {
      if (!name) return '?';
      return name.split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    },

    signOut() {
      sessionStorage.removeItem('crm_token');
      sessionStorage.removeItem('crm_business_id');
      window.location.href = '/login';
    },

    openModal(id) {
      document.getElementById(id).classList.add('open');
    },

    closeModal(id) {
      const overlay = document.getElementById(id);
      overlay.classList.remove('open');
      const form = overlay.querySelector('form');
      if (form) form.reset();
    },

    statusBadge(status, map) {
      const defaults = {
        new: 'badge-blue',
        active: 'badge-green',
        contacted: 'badge-teal',
        quoted: 'badge-yellow',
        scheduled: 'badge-blue',
        completed: 'badge-green',
        cancelled: 'badge-red',
        draft: 'badge-gray',
        sent: 'badge-blue',
        accepted: 'badge-green',
        rejected: 'badge-red',
        open: 'badge-blue',
        closed: 'badge-gray',
        won: 'badge-green',
        lost: 'badge-red',
        sms: 'badge-teal',
        email: 'badge-blue',
        sent_dir: 'badge-gray',
        received: 'badge-green',
      };
      const cls = (map && map[status]) || defaults[status] || 'badge-gray';
      return '<span class="badge ' + cls + '">' + (status || '—') + '</span>';
    },

    buildSidebar(activePage) {
      const pages = [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'contacts', label: 'Contacts', href: '/contacts-ui', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { id: 'leads', label: 'Leads', href: '/leads-ui', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { id: 'jobs', label: 'Jobs', href: '/jobs-ui', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { id: 'quotes', label: 'Quotes', href: '/quotes-ui', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'pipeline', label: 'Pipeline', href: '/pipeline-ui', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { id: 'communications', label: 'Communications', href: '/communications-ui', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        { id: 'automations', label: 'Automations', href: '/automations-ui', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      ];

      return '<aside class="sidebar">' +
        '<div class="sidebar-header">' +
        '<div class="brand-icon"><svg fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>' +
        '<span class="brand-name">Service CRM</span>' +
        '</div>' +
        '<nav class="sidebar-nav">' +
        pages.map(function (p) {
          return '<a class="nav-item' + (activePage === p.id ? ' active' : '') + '" href="' + p.href + '">' +
            '<svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="' + p.icon + '"/></svg>' +
            p.label + '</a>';
        }).join('') +
        '</nav>' +
        '<div class="sidebar-footer">' +
        '<div class="user-row" onclick="CRM.signOut()">' +
        '<div class="user-avatar">A</div>' +
        '<div class="user-info"><div class="user-name">Administrator</div><div class="user-sub">Sign out</div></div>' +
        '<svg class="signout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>' +
        '</div></div></aside>';
    },
  };

  CRM.guardAuth();
})();
