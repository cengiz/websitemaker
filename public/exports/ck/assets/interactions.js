(function(){
  // ── Hero Slider ────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-hero-slider]').forEach(function(el){
    var slides = Array.from(el.querySelectorAll('[data-slide]'));
    var dots   = Array.from(el.querySelectorAll('[data-dot]'));
    var prev   = el.querySelector('[data-prev]');
    var next   = el.querySelector('[data-next]');
    var current = 0;
    var timer;

    function activate(idx){
      slides[current].style.opacity = '0';
      slides[current].style.zIndex  = '0';
      if(dots[current]){ dots[current].style.width='8px'; dots[current].style.background='rgba(255,255,255,0.5)'; }
      current = (idx + slides.length) % slides.length;
      slides[current].style.opacity = '1';
      slides[current].style.zIndex  = '1';
      if(dots[current]){ dots[current].style.width='24px'; dots[current].style.background='white'; }
    }

    function start(){ timer = setInterval(function(){ activate(current+1); }, 5000); }
    function stop() { clearInterval(timer); }

    if(slides.length > 1){
      start();
      if(prev) prev.addEventListener('click', function(){ stop(); activate(current-1); start(); });
      if(next) next.addEventListener('click', function(){ stop(); activate(current+1); start(); });
      dots.forEach(function(d,i){ d.addEventListener('click', function(){ stop(); activate(i); start(); }); });
      el.addEventListener('mouseenter', stop);
      el.addEventListener('mouseleave', start);
      document.addEventListener('keydown', function(e){
        if(e.key==='ArrowLeft'){ stop(); activate(current-1); start(); }
        else if(e.key==='ArrowRight'){ stop(); activate(current+1); start(); }
      });
    }
  });

  // ── Card Carousel ──────────────────────────────────────────────────────────
  document.querySelectorAll('[data-carousel]').forEach(function(el){
    var track = el.querySelector('[data-track]');
    var cards = Array.from(el.querySelectorAll('[data-card]'));
    var dots  = Array.from(el.querySelectorAll('[data-dot]'));
    var prev  = el.querySelector('[data-prev]');
    var next  = el.querySelector('[data-next]');
    var GAP = 16, PEEK = 48;
    var current = 0;

    function cardWidth(){ return el.offsetWidth - PEEK - GAP; }

    function goTo(idx){
      current = Math.max(0, Math.min(cards.length-1, idx));
      track.style.transform = 'translateX('+(-current*(cardWidth()+GAP))+'px)';
      dots.forEach(function(d,i){
        d.style.width  = i===current ? '24px' : '6px';
        d.style.background = i===current ? 'var(--site-primary)' : 'var(--site-border)';
      });
      if(prev) prev.disabled = current===0;
      if(next) next.disabled = current===cards.length-1;
    }

    if(cards.length > 1){
      if(prev) prev.addEventListener('click', function(){ goTo(current-1); });
      if(next) next.addEventListener('click', function(){ goTo(current+1); });
      dots.forEach(function(d,i){ d.addEventListener('click', function(){ goTo(i); }); });
      window.addEventListener('resize', function(){ goTo(current); });
    }
    goTo(0);
  });
})();