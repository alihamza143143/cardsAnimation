/* ═══════════════════════════════════════════
   Card Fan Animation — Shopify Section Script
   Performance-optimized: typed arrays, event
   delegation, throttled mouse, DOM-diff writes
   ═══════════════════════════════════════════ */
(function(){
  'use strict';

  var section = document.querySelector('.card-fan-section');
  if(!section) return;

  var fan = section.querySelector('.card-fan');
  if(!fan) return;

  var cardEls = fan.querySelectorAll('.card-fan__card');
  var TOTAL   = cardEls.length;
  if(TOTAL === 0) return;

  function getFanDeg(){
    if(window.innerWidth < 640)  return 110;
    if(window.innerWidth < 1024) return 140;
    return 160;
  }

  var CYCLE = 6000, SFRAC = 0.12, MIN_P = 0.15;
  var P1 = 0.05, P2 = 0.38, P3 = 0.62, P4 = 0.95;

  function ease(t){
    return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
  }
  function clamp01(v){ return v<0?0:v>1?1:v; }

  var fanDeg     = getFanDeg();
  var startTime  = null;
  var hoveredIdx = -1;

  var targets    = new Float32Array(TOTAL);
  var lifts      = new Float32Array(TOTAL);
  var prevAngles = new Float32Array(TOTAL);
  var prevLifts  = new Float32Array(TOTAL);
  var els        = [];

  var halfCount = (TOTAL-1)/2;
  var invCount  = 1/(TOTAL-1);

  var mouseX = 0.5, smoothMouseX = 0.5;

  function calcAngle(i){
    return -fanDeg/2 + i*(fanDeg/(TOTAL-1));
  }

  for(var i=0; i<TOTAL; i++){
    var el = cardEls[i];
    el.style.zIndex = i;
    el.dataset.idx = i;
    els.push(el);
    targets[i] = calcAngle(i);
    prevAngles[i] = -999;
    prevLifts[i] = -999;
  }

  /* Event delegation */
  fan.addEventListener('mouseenter', function(e){
    var card = e.target.closest('.card-fan__card');
    if(!card) return;
    hoveredIdx = parseInt(card.dataset.idx,10);
    card.classList.add('hovered');
    fan.classList.add('has-hover');
  }, true);

  fan.addEventListener('mouseleave', function(e){
    var card = e.target.closest('.card-fan__card');
    if(!card) return;
    var idx = parseInt(card.dataset.idx,10);
    if(hoveredIdx===idx) hoveredIdx=-1;
    card.classList.remove('hovered');
    if(hoveredIdx===-1) fan.classList.remove('has-hover');
  }, true);

  var mouseMoveThrottle = false;
  document.addEventListener('mousemove', function(e){
    if(mouseMoveThrottle) return;
    mouseMoveThrottle = true;
    mouseX = e.clientX/window.innerWidth;
    requestAnimationFrame(function(){ mouseMoveThrottle=false; });
  }, {passive:true});

  var isVisible = true, isInView = true, rafId = null;

  function shouldRun(){ return isVisible && isInView; }
  function startLoop(){ if(!rafId) rafId=requestAnimationFrame(tick); }
  function stopLoop(){ if(rafId){ cancelAnimationFrame(rafId); rafId=null; startTime=null; } }

  function tick(ts){
    if(!startTime) startTime = ts;
    var cycleT = ((ts-startTime)%CYCLE)/CYCLE;

    smoothMouseX += (mouseX-smoothMouseX)*0.04;
    var mouseInfl = (smoothMouseX-0.5)*16;

    for(var i=0; i<TOTAL; i++){
      var progress;
      if(cycleT<=P1){
        progress = MIN_P;
      } else if(cycleT<=P2){
        var pt=(cycleT-P1)/(P2-P1), d=i*invCount*SFRAC;
        progress = MIN_P+0.85*ease(clamp01((pt-d)/(1-d)));
      } else if(cycleT<=P3){
        progress = 1;
      } else if(cycleT<=P4){
        var pt2=(cycleT-P3)/(P4-P3), d2=(TOTAL-1-i)*invCount*SFRAC;
        progress = 1-0.85*ease(clamp01((pt2-d2)/(1-d2)));
      } else {
        progress = MIN_P;
      }

      var angle = targets[i]*progress + (i*invCount-smoothMouseX)*mouseInfl*progress;

      var lt = (i===hoveredIdx)?1:0;
      lifts[i] += (lt-lifts[i])*0.12;
      if(lifts[i]<0.003 && lt===0) lifts[i]=0;
      if(lifts[i]>0.997 && lt===1) lifts[i]=1;

      var aR=(angle*100|0), lR=(lifts[i]*100|0);
      if(aR===prevAngles[i] && lR===prevLifts[i]) continue;
      prevAngles[i]=aR; prevLifts[i]=lR;

      var arcNorm=(i-halfCount)/halfCount;
      var arcY=-(arcNorm<0?-arcNorm:arcNorm)*8*progress;
      var tf='rotate('+angle.toFixed(2)+'deg) translateY('+arcY.toFixed(1)+'px)';

      if(lifts[i]>0.01){
        tf+=' translateY('+(-28*lifts[i]).toFixed(1)+'px) scale('+(1+0.08*lifts[i]).toFixed(4)+')';
      }

      els[i].style.transform = tf;
      var z=lifts[i]>0.3?100:i;
      if(els[i].style.zIndex!=z) els[i].style.zIndex=z;
    }

    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', function(){
    isVisible=!document.hidden;
    if(shouldRun()) startLoop(); else stopLoop();
  });

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      isInView=entries[0].isIntersecting;
      if(shouldRun()) startLoop(); else stopLoop();
    },{threshold:0}).observe(fan);
  }

  startLoop();

  /* Touch support */
  var activeTouch=null, touchDetected=false;
  fan.addEventListener('touchstart', function(){ touchDetected=true; }, {once:true,passive:true});

  fan.addEventListener('click', function(e){
    if(!touchDetected) return;
    var card=e.target.closest('.card-fan__card');
    if(card){
      var idx=parseInt(card.dataset.idx,10);
      if(activeTouch && activeTouch!==card){
        activeTouch.classList.remove('touch-active','hovered');
        if(hoveredIdx===parseInt(activeTouch.dataset.idx,10)) hoveredIdx=-1;
      }
      if(card.classList.contains('touch-active')){
        card.classList.remove('touch-active','hovered');
        fan.classList.remove('has-hover');
        activeTouch=null; hoveredIdx=-1;
      } else {
        card.classList.add('touch-active','hovered');
        fan.classList.add('has-hover');
        activeTouch=card; hoveredIdx=idx;
      }
      return;
    }
    if(activeTouch){
      activeTouch.classList.remove('touch-active','hovered');
      fan.classList.remove('has-hover');
      activeTouch=null; hoveredIdx=-1;
    }
  });

  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt=setTimeout(function(){
      fanDeg=getFanDeg();
      for(var i=0;i<TOTAL;i++) targets[i]=calcAngle(i);
    },200);
  });

})();
