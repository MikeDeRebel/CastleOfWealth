(() => {
  const courseRoot = document.querySelector('[data-course-root]');
  if (!courseRoot) return;

  const slides = [
    {
      title: 'Slide 1 — Cover',
      image: 'assets/img/cover.png',
      alt: 'Bitcoin Technical Analysis Course cover slide',
      text: 'Learn how to read Bitcoin charts and understand market movements. No experience needed — start from zero.'
    },
    {
      title: 'Slide 2 — What You’ll Learn',
      image: 'assets/img/learn.png',
      alt: 'What you will learn in technical analysis slide',
      text: 'In this lesson, you’ll learn the core building blocks of technical analysis. By the end, you’ll be able to read a chart with clarity and confidence.'
    },
    {
      title: 'Slide 3 — What Is a Price Chart',
      image: 'assets/img/price-chart.png',
      alt: 'Bitcoin price chart concept slide',
      text: 'A price chart shows how Bitcoin moves over time. Every move reflects the battle between buyers and sellers.'
    },
    {
      title: 'Slide 4 — Candlesticks',
      image: 'assets/img/candlestick.png',
      alt: 'Candlestick explanation slide',
      text: 'Each candlestick shows price movement in a specific time period. It tells you who is in control — buyers or sellers.'
    },
    {
      title: 'Slide 5 — Trends',
      image: 'assets/img/trend.png',
      alt: 'Market trend directions slide',
      text: 'Markets move in trends: up, down, or sideways. Your goal is to recognize the direction and follow it.'
    },
    {
      title: 'Slide 6 — Support & Resistance',
      image: 'assets/img/support-resistance.png',
      alt: 'Support and resistance levels slide',
      text: 'Price reacts at key levels called support and resistance. These zones help you understand where price may bounce or reject.'
    },
    {
      title: 'Slide 7 — Wrap-Up',
      image: 'assets/img/understand.png',
      alt: 'Technical analysis wrap-up slide',
      text: 'You now understand how to read charts, trends, and key levels. You’re no longer guessing — you’re reading the market.'
    },
    {
      title: 'Slide 8 — Next Step',
      image: 'assets/img/next-step.png',
      alt: 'Next step after learning technical analysis basics slide',
      text: 'You’ve learned the basics. Now it’s time to apply them. Next: entries, risk management, and real trade execution.'
    }
  ];

  const imageEl = courseRoot.querySelector('[data-course-image]');
  const headingEl = courseRoot.querySelector('[data-course-heading]');
  const textEl = courseRoot.querySelector('[data-course-text]');
  const progressEl = courseRoot.querySelector('[data-course-progress]');
  const prevBtn = courseRoot.querySelector('[data-course-prev]');
  const nextBtn = courseRoot.querySelector('[data-course-next]');

  let currentSlide = 0;

  const renderSlide = () => {
    const slide = slides[currentSlide];
    imageEl.src = slide.image;
    imageEl.alt = slide.alt;
    headingEl.textContent = slide.title;
    textEl.textContent = slide.text;
    progressEl.textContent = `Slide ${currentSlide + 1} of ${slides.length}`;
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slides.length - 1;
  };

  prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
      currentSlide -= 1;
      renderSlide();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
      currentSlide += 1;
      renderSlide();
    }
  });

  renderSlide();

  const quizForm = courseRoot.querySelector('[data-quiz-form]');
  const questionsHost = courseRoot.querySelector('[data-quiz-questions]');
  const resultHost = courseRoot.querySelector('[data-quiz-result]');
  const restartBtn = courseRoot.querySelector('[data-quiz-restart]');

  const quizData = [
    {
      question: '1. What does a price chart show?',
      options: ['A. Bitcoin movement over time', 'B. News headlines', 'C. Exchange fees'],
      answer: 'A. Bitcoin movement over time'
    },
    {
      question: '2. What does a candlestick represent?',
      options: ['A. A trading platform', 'B. Price movement during a specific time period', 'C. A wallet balance'],
      answer: 'B. Price movement during a specific time period'
    },
    {
      question: '3. A green candle usually means:',
      options: ['A. Buyers are in control', 'B. Sellers are in control', 'C. No trading happened'],
      answer: 'A. Buyers are in control'
    },
    {
      question: '4. What are support and resistance?',
      options: ['A. Random prices', 'B. Key levels where price may react', 'C. Exchange names'],
      answer: 'B. Key levels where price may react'
    },
    {
      question: '5. What are the three basic trend types?',
      options: ['A. Fast, slow, neutral', 'B. Up, down, sideways', 'C. Bullish, bearish, invisible'],
      answer: 'B. Up, down, sideways'
    }
  ];

  const renderQuiz = () => {
    questionsHost.innerHTML = quizData
      .map(
        (item, index) => `
        <fieldset class="quiz-question" data-question-index="${index}">
          <legend>${item.question}</legend>
          <div class="quiz-options">
            ${item.options
              .map(
                (option, optionIndex) => `
                  <label>
                    <input type="radio" name="question-${index}" value="${option}" ${optionIndex === 0 ? '' : ''} />
                    <span>${option}</span>
                  </label>
                `
              )
              .join('')}
          </div>
          <p class="quiz-feedback" data-feedback="${index}"></p>
        </fieldset>
      `
      )
      .join('');

    resultHost.textContent = 'Score: — / 5';
  };

  quizForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let score = 0;

    quizData.forEach((item, index) => {
      const selection = quizForm.querySelector(`input[name="question-${index}"]:checked`);
      const feedbackEl = quizForm.querySelector(`[data-feedback="${index}"]`);

      if (selection && selection.value === item.answer) {
        score += 1;
        feedbackEl.textContent = '✅ Correct';
        feedbackEl.classList.remove('incorrect');
        feedbackEl.classList.add('correct');
      } else {
        feedbackEl.textContent = `❌ Incorrect. Correct answer: ${item.answer}`;
        feedbackEl.classList.remove('correct');
        feedbackEl.classList.add('incorrect');
      }
    });

    resultHost.textContent = `Score: ${score} / ${quizData.length}`;
  });

  restartBtn.addEventListener('click', () => {
    renderQuiz();
  });

  renderQuiz();
})();
