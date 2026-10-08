(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CourseContext = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const COURSES = [
    {
      id: 'C01', number: 1, ordinal: '第一堂', name: '現場幹部的角色與責任', page: 'course01.html',
      slideUrl: 'https://docs.google.com/presentation/d/1BX5wWaszSJTwxCKt6Mh9P76pGP7dhrkH/edit?usp=drivesdk&ouid=116493872695254554480&rtpof=true&sd=true',
    },
    {
      id: 'C02', number: 2, ordinal: '第二堂', name: '工作安排與進度掌握', page: 'course02.html',
      slideUrl: 'https://docs.google.com/presentation/d/1kTR-a77AyvccZb60p2xJnnMftGA8QxRM/edit?usp=drivesdk&ouid=116493872695254554480&rtpof=true&sd=true',
    },
    {
      id: 'C03', number: 3, ordinal: '第三堂', name: '品質意識與自主檢查', page: 'course03.html',
      slideUrl: 'https://docs.google.com/presentation/d/1Kgd37u0VXOMXav8Il9N9nDNJdrf8Ojn_/edit?usp=drivesdk&ouid=116493872695254554480&rtpof=true&sd=true',
    },
  ];

  function getCourseContext(courseId) {
    return COURSES.find(course => course.id === courseId) || COURSES[0];
  }

  function renderCourseToolLinks(container, type) {
    if (!container) return;
    const page = type === 'leaderboard' ? 'leaderboard.html' : 'stats.html';
    container.innerHTML = COURSES.map(course =>
      `<a class="btn course-link" href="${page}?courseId=${course.id}">第${course.number}堂｜${course.name}</a>`
    ).join('');
  }

  function renderCourseSlideLinks(container) {
    if (!container) return;
    container.innerHTML = COURSES.map(course => {
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
      subtitleEl.textContent = leaderboard
        ? `顯示${course.ordinal}所有填寫人員的代號與成績；Email 永不公開`
        : `查看${course.ordinal}的整體成績、能力面向與常錯題`;
    }
    if (quizLink) quizLink.href = course.page;
    doc.title = `${suffix}｜${course.ordinal}｜${course.name}`;
    return course;
  }

  return { COURSES, getCourseContext, renderCourseToolLinks, renderCourseSlideLinks, applyCoursePageContext };
});
