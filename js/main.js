(function () {
  'use strict';

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

  const form = document.getElementById('colaborarForm');
  if (!form) return;

  const submitBtn = document.getElementById('colaborarSubmit');
  const feedback = document.getElementById('colaborarFeedback');
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

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const interestValue = form.elements.namedItem('interest').value;
    const interestLabel = INTEREST_LABELS[interestValue] || interestValue;
    const phone = form.elements.namedItem('phone').value.trim();
    const userMessage = form.elements.namedItem('message').value.trim();

    const formData = new FormData(form);
    formData.append('access_key', 'f5115f3d-7093-4f5b-9d50-778e1f769a95');
    formData.append('subject', 'Nova colaboração: ' + interestLabel);
    formData.append('from_name', 'Site Projeto Vida');
    formData.set('interest', interestLabel);
    formData.set(
      'message',
      ['Área de interesse: ' + interestLabel, 'Telefone: ' + phone, '', userMessage || 'Nenhuma mensagem adicional.'].join('\n')
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
