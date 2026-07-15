(function () {
  'use strict';

  /* ========== LGPD + Google Tag Manager ========== */
  var GTM_ID = 'GTM-WFS2866M';
  var CONSENT_KEY = 'projetovida_lgpd_consent';
  var gtmLoaded = false;

  function loadGoogleTagManager() {
    if (gtmLoaded) return;
    gtmLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });

    var firstScript = document.getElementsByTagName('script')[0];
    var gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    firstScript.parentNode.insertBefore(gtmScript, firstScript);

    var noscriptHost = document.getElementById('gtm-noscript');
    if (noscriptHost && !noscriptHost.querySelector('iframe')) {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.googletagmanager.com/ns.html?id=' + GTM_ID;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      iframe.title = 'Google Tag Manager';
      noscriptHost.appendChild(iframe);
    }
  }

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      // Ignore storage errors (modo privado / restrições)
    }
  }

  function showLgpdBanner() {
    var banner = document.getElementById('lgpdBanner');
    if (banner) banner.hidden = false;
  }

  function hideLgpdBanner() {
    var banner = document.getElementById('lgpdBanner');
    if (banner) banner.hidden = true;
  }

  function applyConsent(value) {
    setConsent(value);
    hideLgpdBanner();

    if (value === 'accepted') {
      loadGoogleTagManager();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'lgpd_consent_accepted' });
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'lgpd_consent_rejected' });

    // Se o GTM já estava ativo, recarrega para interromper a captura
    if (gtmLoaded) {
      window.location.reload();
    }
  }

  function initLgpdConsent() {
    var consent = getConsent();
    var acceptBtn = document.getElementById('lgpdAcceptBtn');
    var rejectBtn = document.getElementById('lgpdRejectBtn');
    var manageBtn = document.getElementById('lgpdManageBtn');

    if (consent === 'accepted') {
      loadGoogleTagManager();
    } else if (!consent) {
      showLgpdBanner();
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        applyConsent('accepted');
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        applyConsent('rejected');
      });
    }

    if (manageBtn) {
      manageBtn.addEventListener('click', function () {
        showLgpdBanner();
      });
    }
  }

  initLgpdConsent();

  /* ========== Header / navegação ========== */
  const header = document.querySelector('.site-header');

  function updateHeaderShadow() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const navCollapse = document.querySelector('#mainNav');
      if (navCollapse && navCollapse.classList.contains('show')) {
        const toggler = document.querySelector('.navbar-toggler');
        if (toggler) toggler.click();
      }

      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.section-quem-somos, .section-projetos, .section-bazar, .section-apadrinhar, .section-colaborar').forEach(function (section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(24px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  document.head.insertAdjacentHTML(
    'beforeend',
    '<style>.is-visible { opacity: 1 !important; transform: translateY(0) !important; }</style>'
  );

  /* ========== Formulário de colaboração ========== */
  const form = document.getElementById('colaborarForm');
  if (!form) return;

  const submitBtn = document.getElementById('colaborarSubmit');
  const feedback = document.getElementById('colaborarFeedback');
  const lgpdCheckbox = document.getElementById('colaborarLgpd');
  const btnText = submitBtn.querySelector('.btn-colaborar-text');
  const btnLoading = submitBtn.querySelector('.btn-colaborar-loading');

  const INTEREST_LABELS = {
    apadrinhamento: 'Apadrinhamento de Natal',
    bazar: 'Doação para o Bazar Beneficente',
    voluntariado: 'Quero ser voluntário(a)',
    oficinas: 'Oficinas e projetos (esporte, música, arte, cultura)',
    doacao_financeira: 'Doação financeira / patrocínio',
    parceria: 'Parceria empresarial / institucional',
    materiais: 'Doação de materiais e equipamentos',
    outros: 'Outros',
  };

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.classList.toggle('d-none', isLoading);
    btnLoading.classList.toggle('d-none', !isLoading);
  }

  function showFeedback(type, message) {
    feedback.classList.remove('d-none', 'is-success', 'is-error');
    feedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    feedback.textContent = message;
  }

  function hideFeedback() {
    feedback.classList.add('d-none');
    feedback.classList.remove('is-success', 'is-error');
    feedback.textContent = '';
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    hideFeedback();

    if (!lgpdCheckbox || !lgpdCheckbox.checked) {
      form.classList.add('was-validated');
      showFeedback('error', 'Marque a autorização de tratamento de dados (LGPD) para continuar.');
      if (lgpdCheckbox) lgpdCheckbox.focus();
      return;
    }

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const interestValue = form.elements.namedItem('interest').value;
    const interestLabel = INTEREST_LABELS[interestValue] || interestValue;
    const phone = form.elements.namedItem('phone').value.trim();
    const userMessage = form.elements.namedItem('message').value.trim();

    const formData = new FormData(form);
    formData.delete('lgpd_consent');
    formData.delete('botcheck');
    formData.append('access_key', 'f5115f3d-7093-4f5b-9d50-778e1f769a95');
    formData.append('subject', 'Nova colaboração: ' + interestLabel);
    formData.append('from_name', 'Site Projeto Vida');
    formData.set('interest', interestLabel);
    formData.set(
      'message',
      [
        'Área de interesse: ' + interestLabel,
        'Telefone: ' + phone,
        'Consentimento LGPD: aceito',
        '',
        userMessage || 'Nenhuma mensagem adicional.',
      ].join('\n')
    );

    setLoading(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(function () {
        return { success: false, message: 'Não foi possível processar a resposta do servidor.' };
      });

      if (response.ok && data.success) {
        form.reset();
        form.classList.remove('was-validated');
        showFeedback('success', 'Mensagem enviada com sucesso! Em breve entraremos em contato.');
      } else {
        showFeedback('error', data.message || 'Não foi possível enviar sua mensagem. Tente novamente.');
      }
    } catch (error) {
      showFeedback('error', 'Algo deu errado. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  });
})();
