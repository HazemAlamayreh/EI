var freeQuizIndex = 0;
var freeQuizScore = 0;
var freeQuizCompleted = Array.from({length: steps.length}, () => false);
var freeLastDirection = 'next';

function renderElementTabs(){
  var el = document.getElementById('elementTabs');
  if(!el) return;
  el.innerHTML = steps.map(function(s,i){
    return '<button class="element-tab" onclick="setStep('+i+')" id="elementTab'+i+'">'
      + '<span class="et-num">'+(i+1)+'</span>'
      + '<span class="et-name">'+s.name+'</span>'
      + '</button>';
  }).join('');
}

function setStep(i){
  step = i;
  sub = 'learn';
  freeQuizIndex = 0;
  freeQuizScore = 0;
  freeLastDirection = 'next';
  render();
}

function setSub(s){
  sub = s;
  if(s === 'quiz'){
    freeQuizIndex = 0;
    freeQuizScore = 0;
    freeQuizCompleted[step] = false;
  }
  render();
}

function render(){
  var d = steps[step];
  $('stepPill').textContent = 'Element ' + (step+1) + ' of 7';
  $('progressBar').style.width = (((step+1)/7)*100) + '%';
  $('kicker').textContent = 'Element ' + (step+1) + ' • ' + d.name;
  $('hero').textContent = d.hero;
  $('subtitle').textContent = d.subtitle;

  document.querySelectorAll('.element-tab').forEach(function(b,i){
    b.classList.toggle('active', i === step);
  });
  var activeTab = document.getElementById('elementTab' + step);
  if(activeTab) activeTab.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});

  ['learn','quiz','activity'].forEach(function(x){
    var tab = document.getElementById(x + 'Tab');
    if(tab) tab.classList.toggle('active', sub === x);
  });

  if(sub === 'learn') renderLearnOpen();
  if(sub === 'quiz') renderQuizOpen();
  if(sub === 'activity') renderActivity();

  $('nextBtn').textContent = sub === 'learn'
    ? 'Go to Quiz • انتقل للاختبار'
    : sub === 'quiz'
      ? 'Go to Case • انتقل للحالة'
      : 'Next Element • العنصر التالي';
  window.scrollTo({top:0, behavior:'smooth'});
}

function renderLearnOpen(){
  var d = steps[step];
  var pts = d.points.map(function(p,i){
    return '<div class="point">'
      + '<div class="num">'+(i+1)+'</div>'
      + '<div><b>'+p[0]+'</b><small>'+p[1]+'</small>'
      + '<div class="arline"><b>'+p[2]+'</b><br>'+p[3]+'</div></div>'
      + '</div>';
  }).join('');
  $('screen').innerHTML = '<div class="section-head">'
    + '<span class="lang">SUMMARY • ملخص</span>'
    + '<h2>'+d.name+'</h2>'
    + '<p>Review the preparation idea first, then take a short quiz, then apply it to the case.</p>'
    + '<p class="ar">راجع فكرة التحضير أولًا، ثم أجب عن اختبار قصير، ثم طبّقها على الحالة.</p>'
    + '</div>'
    + '<div class="bilingual">'
    + '<div class="card"><span class="lang">ENGLISH</span><h3>What does this element mean?</h3><p>'+d.learn_en+'</p></div>'
    + '<div class="card ar"><span class="lang">العربية</span><h3>ما المقصود بهذا العنصر؟</h3><p>'+d.learn_ar+'</p></div>'
    + '</div>' + pts;
}

function renderQuizOpen(){
  var d = steps[step];
  if(freeQuizCompleted[step]){
    renderQuizResultOpen();
    return;
  }
  var q = d.quiz[freeQuizIndex];
  var progress = (freeQuizIndex+1) + ' / ' + d.quiz.length;
  $('screen').innerHTML = '<div class="section-head">'
    + '<span class="lang">QUIZ • اختبار</span>'
    + '<h2>'+d.name+' Knowledge Check</h2>'
    + '<p>Questions appear one by one. Choose an answer and the next question will open automatically.</p>'
    + '<p class="ar">تظهر الأسئلة سؤالًا بسؤال. اختر إجابة وسينتقل التطبيق تلقائيًا إلى السؤال التالي.</p>'
    + '</div>'
    + '<div class="quiz-mini-progress"><span style="width:'+(((freeQuizIndex+1)/d.quiz.length)*100)+'%"></span></div>'
    + '<div class="quiz-count">Question '+progress+' • السؤال '+progress+'</div>'
    + '<div class="quiz-slide '+(freeLastDirection === 'next' ? 'slide-in-right' : 'slide-in-left')+'" id="quizSlide">'
    + '<div class="quiz-card single">'
    + '<div class="quiz-q">'+(freeQuizIndex+1)+'. '+q[0]+'</div>'
    + '<div class="qar">'+(freeQuizIndex+1)+'. '+q[1]+'</div>'
    + '<div class="opts">'
    + q[2].map(function(o,oi){
        return '<button class="opt" onclick="chooseQuizOpen('+oi+', this)"><div>'+o[0]+'</div><div class="ar" style="margin-top:4px;font-size:13px">'+o[1]+'</div></button>';
      }).join('')
    + '</div><div class="feedback" id="quizFeedback"></div></div></div>'
    + '<div class="free-note">Free navigation is enabled. You can move to any element or tab anytime. • التنقل حر، يمكنك الانتقال لأي عنصر أو تبويب في أي وقت.</div>';
}

function chooseQuizOpen(oi, btn){
  var q = steps[step].quiz[freeQuizIndex];
  var opts = Array.from(document.querySelectorAll('.opt'));
  opts.forEach(function(b){ b.disabled = true; });
  btn.classList.add(oi === q[3] ? 'correct' : 'wrong');
  if(oi !== q[3] && opts[q[3]]) opts[q[3]].classList.add('correct');
  if(oi === q[3]) freeQuizScore++;

  var fb = $('quizFeedback');
  fb.className = 'feedback show ' + (oi === q[3] ? 'good' : 'bad');
  fb.textContent = oi === q[3] ? 'Correct • صحيح' : 'Review this point • راجع هذه النقطة';

  setTimeout(function(){
    var slide = $('quizSlide');
    if(slide) slide.classList.add('slide-out-left');
    setTimeout(function(){
      freeQuizIndex++;
      freeLastDirection = 'next';
      if(freeQuizIndex >= steps[step].quiz.length){
        freeQuizCompleted[step] = true;
        renderQuizResultOpen();
      }else{
        renderQuizOpen();
      }
    },260);
  },650);
}

function renderQuizResultOpen(){
  var total = steps[step].quiz.length;
  $('screen').innerHTML = '<div class="result">'
    + '<div>Quiz Complete • اكتمل الاختبار</div>'
    + '<div class="score">'+freeQuizScore+'/'+total+'</div>'
    + '<p>You can retake the quiz or continue freely to the case or any other element.</p>'
    + '<p class="ar">يمكنك إعادة الاختبار أو الانتقال بحرية إلى الحالة أو أي عنصر آخر.</p>'
    + '<div class="racts">'
    + '<button class="retry" onclick="retakeQuizOpen()">Retake • إعادة</button>'
    + '<button class="continue" onclick="setSub(\'activity\')">Go to Case • الحالة</button>'
    + '</div></div>';
}

function retakeQuizOpen(){
  freeQuizIndex = 0;
  freeQuizScore = 0;
  freeQuizCompleted[step] = false;
  freeLastDirection = 'next';
  renderQuizOpen();
}

function next(){
  if(sub === 'learn'){
    sub = 'quiz';
    freeQuizIndex = 0;
    freeQuizScore = 0;
    freeQuizCompleted[step] = false;
    render();
    return;
  }
  if(sub === 'quiz'){
    sub = 'activity';
    render();
    return;
  }
  if(sub === 'activity'){
    if(step < steps.length - 1){
      step++;
      sub = 'learn';
      freeQuizIndex = 0;
      freeQuizScore = 0;
      render();
    }else{
      renderFinishOpen();
    }
  }
}

function back(){
  if(sub === 'activity'){
    sub = 'quiz';
    render();
    return;
  }
  if(sub === 'quiz'){
    sub = 'learn';
    render();
    return;
  }
  if(sub === 'learn' && step > 0){
    step--;
    sub = 'activity';
    render();
  }
}

function renderFinishOpen(){
  $('screen').innerHTML = '<div class="result">'
    + '<h2>Preparation Review Complete</h2>'
    + '<div class="score">7 / 7</div>'
    + '<p>You can still go back to any element from the tabs above.</p>'
    + '<p class="ar">يمكنك الرجوع لأي عنصر من التابات بالأعلى في أي وقت.</p>'
    + '</div>';
  $('hero').textContent = 'Ready to negotiate.';
  $('subtitle').textContent = 'Preparation creates confidence.';
  $('kicker').textContent = 'Free Navigation Mode';
  $('stepPill').textContent = 'Open Access';
  $('progressBar').style.width = '100%';
}

renderElementTabs();
render();
