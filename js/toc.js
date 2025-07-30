// TOC功能脚本
document.addEventListener('DOMContentLoaded', function() {
  const tocArticle = document.querySelector('.toc-article');
  if (!tocArticle) return;

  const tocTitle = tocArticle.querySelector('.toc-title');
  const tocList = tocArticle.querySelector('#toc');
  
  // 创建提示元素
  const createHint = () => {
    const hint = document.createElement('div');
    hint.className = 'toc-hint';
    hint.textContent = '点击可展开/收起目录';
    document.body.appendChild(hint);
    return hint;
  };
  
  // 创建切换按钮
  const createToggleBtn = () => {
    const btn = document.createElement('button');
    btn.className = 'toc-toggle-btn';
    btn.innerHTML = '≡';
    btn.title = '显示/隐藏目录 (Ctrl+T)';
    document.body.appendChild(btn);
    return btn;
  };
  
  const hint = createHint();
  const toggleBtn = createToggleBtn();
  
  // 显示提示
  const showHint = () => {
    hint.classList.add('show');
    setTimeout(() => {
      hint.classList.remove('show');
    }, 3000);
  };
  
  // 切换TOC状态的函数
  const toggleToc = () => {
    tocArticle.classList.toggle('toc-collapsed');
    
    // 保存状态到localStorage
    const isCollapsed = tocArticle.classList.contains('toc-collapsed');
    localStorage.setItem('tocCollapsed', isCollapsed);
    
    // 更新按钮状态
    updateToggleBtn();
    
    // 收起时显示简短提示
    if (isCollapsed) {
      hint.textContent = '点击圆形按钮展开目录';
      showHint();
    }
  };
  
  // 为TOC标题添加点击事件
  if (tocTitle) {
    tocTitle.addEventListener('click', toggleToc);
    
    // 恢复折叠状态
    const savedState = localStorage.getItem('tocCollapsed');
    if (savedState === 'true') {
      tocArticle.classList.add('toc-collapsed');
    }
  }
  
  // 为收起状态的TOC添加点击事件
  tocArticle.addEventListener('click', function(e) {
    // 只有在收起状态下才响应点击
    if (tocArticle.classList.contains('toc-collapsed')) {
      // 确保点击的是TOC本身，而不是其子元素
      if (e.target === tocArticle || e.target.closest('.toc-collapsed')) {
        toggleToc();
      }
    }
  });
  
  // 更新切换按钮状态
  const updateToggleBtn = () => {
    const isCollapsed = tocArticle.classList.contains('toc-collapsed');
    
    // 当TOC收起时，隐藏切换按钮
    if (isCollapsed) {
      toggleBtn.classList.add('hidden');
    } else {
      toggleBtn.classList.remove('hidden');
      toggleBtn.innerHTML = '✕';
      toggleBtn.title = '收起目录 (Ctrl+T)';
    }
  };
  
  // 切换按钮点击事件
  toggleBtn.addEventListener('click', toggleToc);
  
  // 初始化按钮状态
  updateToggleBtn();
  
  // 修复TOC链接的href属性
  const fixTocLinks = () => {
    const tocLinks = tocArticle.querySelectorAll('.toc-link');
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    tocLinks.forEach((link, index) => {
      // 如果链接没有href属性，为其添加
      if (!link.getAttribute('href')) {
        const tocText = link.querySelector('.toc-text');
        if (tocText) {
          const text = tocText.textContent.trim();
          // 查找对应的标题
          for (let heading of headings) {
            if (heading.textContent.trim() === text) {
              // 生成锚点ID
              const id = heading.id || heading.textContent.trim()
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                .replace(/^-+|-+$/g, '');
              
              // 如果标题没有ID，为其添加
              if (!heading.id) {
                heading.id = id;
              }
              
              // 为TOC链接添加href
              link.setAttribute('href', `#${id}`);
              break;
            }
          }
        }
      }
    });
  };
  
  // 执行修复
  fixTocLinks();
  
  // 滚动高亮功能
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const tocLinks = tocArticle.querySelectorAll('.toc-link');
  
  if (headings.length > 0 && tocLinks.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 移除所有active类
          tocLinks.forEach(link => link.classList.remove('active'));
          
          // 找到对应的TOC链接并添加active类
          const id = entry.target.id;
          const correspondingLink = tocArticle.querySelector(`a[href="#${id}"]`);
          if (correspondingLink) {
            correspondingLink.classList.add('active');
          }
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px'
    });
    
    headings.forEach(heading => {
      if (heading.id) {
        observer.observe(heading);
      }
    });
  }
  
  // 平滑滚动到目标位置
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = 80; // 根据你的header高度调整
          const targetPosition = targetElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // 键盘快捷键
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      toggleToc();
    }
  });
  
  // 首次访问时显示提示
  const hasVisited = localStorage.getItem('tocHintShown');
  if (!hasVisited) {
    setTimeout(() => {
      hint.textContent = '点击标题可展开/收起目录';
      showHint();
      localStorage.setItem('tocHintShown', 'true');
    }, 2000);
  }
  
  // 鼠标悬停时显示提示
  if (tocTitle) {
    tocTitle.addEventListener('mouseenter', function() {
      if (!hint.classList.contains('show')) {
        const isCollapsed = tocArticle.classList.contains('toc-collapsed');
        hint.textContent = isCollapsed ? '点击展开目录' : '点击收起目录';
        showHint();
      }
    });
  }
  
  // 为收起状态的TOC添加悬停提示
  tocArticle.addEventListener('mouseenter', function() {
    if (tocArticle.classList.contains('toc-collapsed') && !hint.classList.contains('show')) {
      hint.textContent = '点击展开目录';
      showHint();
    }
  });
  
  // 响应式处理
  const handleResize = () => {
    if (window.innerWidth <= 768) {
      toggleBtn.classList.add('hidden');
    } else {
      // 只在非收起状态下显示按钮
      const isCollapsed = tocArticle.classList.contains('toc-collapsed');
      if (!isCollapsed) {
        toggleBtn.classList.remove('hidden');
      }
    }
  };
  
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化时执行一次
}); 