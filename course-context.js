(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CourseContext = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const COURSES = [
    {
      id: 'C01', number: '1', ordinal: '第一堂', toolLabel: '第1堂｜現場幹部的角色與責任',
      name: '現場幹部的角色與責任', page: 'course01.html',
      slideUrl: 'https://docs.google.com/presentation/d/1BX5wWaszSJTwxCKt6Mh9P76pGP7dhrkH/edit?usp=drivesdk&ouid=116493872695254554480&rtpof=true&sd=true',
    },
    {
      id: 'C02', number: '2', ordinal: '第二堂', toolLabel: '第2堂｜工作安排與進度掌握',
      name: '工作安排與進度掌握', page: 'course02.html',
      slideUrl: 'https://docs.google.com/presentation/d/1kTR-a77AyvccZb60p2xJnnMftGA8QxRM/edit?usp=drivesdk&ouid=116493872695254554480&rtpof=true&sd=true',
    },
    {
      id: 'C03', number: '3', ordinal: '第三堂', toolLabel: '第3堂｜品質意識與自主檢查',
      name: '品質意識與自主檢查', page: 'course03.html',
      slideUrl: 'https://docs.google.com/presentation/d/1Kgd37u0VXOMXav8Il9N9nDNJdrf8Ojn_/edit?usp=drivesdk&ouid=116493872695254554480&rtpof=true&sd=true',
    },
    {
      id: 'C04', number: '4、7', ordinal: '第4、7堂', toolLabel: '第4、7堂｜異常處理、紀律5S與安全管理',
      name: '異常處理、紀律5S與安全管理', page: 'course47.html',
      slideUrl: 'https://docs.google.com/presentation/d/1IOr9HPgQO5PTEvSxnPO3AEUgJwkfPDCPYZTJ8-_1e4w/edit?usp=drivesdk',
    },
    {
      id: 'C05', number: '5、6', ordinal: '第5、6堂', toolLabel: '第5、6堂｜新人帶教、現場溝通與工作交接',
      name: '新人帶教、現場溝通與工作交接', page: 'course56.html',
      slideUrl: 'https://docs.google.com/presentation/d/1DskYRg6VnRIFGSqWdInKvW4feY2OUoV7RXdF_Xbe1BA/edit?usp=drivesdk',
    },
    {
      id: 'C08', number: '8', ordinal: '第八堂', toolLabel: '第8堂｜基礎改善與數據管理',
      name: '基礎改善與數據管理', page: 'course08.html',
      slideUrl: 'https://docs.google.com/presentation/d/1R6VLTOWzwDGWxQBqdDSInbp_FiTXZf6OIneAxNmK3RI/edit?usp=drivesdk',
    },
    {
      id: 'FINAL40', number: '總', ordinal: '總會考', toolLabel: '總會考｜1～8堂綜合測驗',
      name: '1～8堂綜合測驗', page: 'leader-final-exam.html', slideUrl: null, finalExam: true,
    },
  ];

  const TEACHING_COURSES = [
    { number: 1, name: '現場幹部的角色與責任', resultId: 'C01' },
    { number: 2, name: '工作安排與進度掌握', resultId: 'C02' },
    { number: 3, name: '品質意識與自主檢查', resultId: 'C03' },
    { number: 4, name: '異常處理與問題判斷', resultId: 'C04', combined: '第4、7堂合併測驗' },
    { number: 5, name: '新人帶教與工作教導', resultId: 'C05', combined: '第5、6堂合併測驗' },
    { number: 6, name: '溝通、回報與工作交接', resultId: 'C05', combined: '第5、6堂合併測驗' },
    { number: 7, name: '現場紀律、5S與安全管理', resultId: 'C04', combined: '第4、7堂合併測驗' },
    { number: 8, name: '基礎改善與數據管理', resultId: 'C08' },
  ];

  function normalizeCourseId(courseId) {
    if (courseId === 'C06') return 'C05';
    if (courseId === 'C07') return 'C04';
    return courseId;
  }

  function getCourseContext(courseId) {
    const id = normalizeCourseId(courseId);
    return COURSES.find(course => course.id === id) || COURSES[0];
  }

  function renderCourseToolLinks(container, type) {
    if (!container) return;
    const page = type === 'leaderboard' ? 'leaderboard.html' : 'stats.html';
    container.innerHTML = COURSES.map(course =>
      `<a class="btn course-link" href="${page}?courseId=${course.id}">${course.toolLabel}</a>`
    ).join('');
  }

  function renderCourseSlideLinks(container) {
    if (!container) return;
    container.innerHTML = COURSES.filter(course => course.slideUrl).map(course => {
      const slideUrl = course.slideUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return `<a class="slide-link" href="${slideUrl}" target="_blank" rel="noopener noreferrer">
        <span>${course.ordinal}</span><small>${course.name}</small>
      </a>`;
    }).join('');
  }

  function applyCoursePageContext(doc, courseId, type) {
    const course = getCourseContext(courseId);
    const leaderboard = type === 'leaderboard';
    const suffix = leaderboard ? '成績列表' : '統計分析';
    const title = `${course.ordinal}｜${course.name}｜${suffix}`;
    const titleEl = doc.getElementById('coursePageTitle');
    const subtitleEl = doc.getElementById('coursePageSubtitle');
    const quizLink = doc.getElementById('courseQuizLink');

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) {
      if (course.finalExam) {
        subtitleEl.textContent = leaderboard
          ? '顯示總會考所有考生的工號、姓名、分數與考試日期'
          : '查看總會考整體成績；總會考目前不另外拆能力面向';
      } else {
        subtitleEl.textContent = leaderboard
          ? `顯示${course.ordinal}所有填寫人員的代號與成績；Email 永不公開`
          : `查看${course.ordinal}的整體成績、能力面向與常錯題`;
      }
    }
    if (quizLink) quizLink.href = course.page;
    doc.title = `${suffix}｜${course.ordinal}｜${course.name}`;
    return course;
  }

  return {
    COURSES,
    TEACHING_COURSES,
    normalizeCourseId,
    getCourseContext,
    renderCourseToolLinks,
    renderCourseSlideLinks,
    applyCoursePageContext,
  };
});
