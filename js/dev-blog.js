(function () {
  "use strict";

  var posts = Array.isArray(window.DEV_BLOG_POSTS) ? window.DEV_BLOG_POSTS : [];
  var reader = document.getElementById("blog-reader");
  var recentList = document.getElementById("blog-recent-list");
  var archive = document.getElementById("blog-archive");
  var count = document.getElementById("blog-entry-count");
  var filterBar = document.getElementById("blog-filters");
  var olderButton = document.getElementById("blog-older");
  var newerButton = document.getElementById("blog-newer");
  var activeFilter = "All";
  var activeSlug = "";

  if (!reader || !recentList || !archive || !posts.length) return;

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function postLink(post, className, label) {
    var link = element("a", className);
    link.href = "#" + post.slug;
    link.dataset.blogSlug = post.slug;
    link.textContent = typeof label === "string" ? label : post.title;
    return link;
  }

  function renderRecent() {
    recentList.replaceChildren();
    posts.slice(0, 7).forEach(function (post) {
      var link = postLink(post, "blog-recent-link", "");
      if (post.slug === activeSlug) link.classList.add("active");
      link.appendChild(element("span", "blog-recent-project", post.project));
      link.appendChild(element("strong", "blog-recent-title", post.title));
      link.appendChild(element("span", "blog-recent-date", post.displayDate));
      recentList.appendChild(link);
    });
  }

  function renderFilters() {
    var categories = ["All"];
    posts.forEach(function (post) {
      if (categories.indexOf(post.category) === -1) categories.push(post.category);
    });

    filterBar.replaceChildren();
    categories.forEach(function (category) {
      var button = element("button", "blog-filter", category);
      button.type = "button";
      button.dataset.filter = category;
      button.setAttribute("aria-pressed", String(category === activeFilter));
      if (category === activeFilter) button.classList.add("active");
      filterBar.appendChild(button);
    });
  }

  function renderArchive() {
    var visible = posts.filter(function (post) {
      return activeFilter === "All" || post.category === activeFilter;
    });

    archive.replaceChildren();
    visible.forEach(function (post) {
      var card = element("article", "blog-archive-card");
      var top = element("div", "blog-archive-top");
      var image = element("img", "blog-archive-image");
      image.src = post.image;
      image.alt = "";
      image.loading = "lazy";
      top.appendChild(image);

      var heading = element("div", "blog-archive-heading");
      heading.appendChild(element("span", "blog-entry-project", post.project));
      var title = element("h3", "blog-archive-title");
      title.appendChild(postLink(post, "blog-title-link"));
      heading.appendChild(title);
      top.appendChild(heading);
      card.appendChild(top);
      card.appendChild(element("p", "blog-archive-summary", post.summary));

      var meta = element("div", "blog-archive-meta");
      meta.appendChild(element("span", "blog-status", post.status));
      meta.appendChild(element("span", "", post.displayDate));
      meta.appendChild(element("span", "", post.readTime));
      card.appendChild(meta);
      card.appendChild(postLink(post, "blog-read-link", "Read entry →"));
      archive.appendChild(card);
    });

    count.textContent = visible.length + (visible.length === 1 ? " entry" : " entries");
  }

  function renderReader(post, shouldFocus) {
    activeSlug = post.slug;
    reader.replaceChildren();

    var header = element("header", "blog-reader-header");
    var image = element("img", "blog-reader-image");
    image.src = post.image;
    image.alt = post.imageAlt;
    header.appendChild(image);

    var heading = element("div", "blog-reader-heading");
    heading.appendChild(element("p", "blog-entry-project", post.project));
    heading.appendChild(element("h2", "blog-reader-title", post.title));
    var meta = element("div", "blog-reader-meta");
    var time = element("time", "", post.displayDate);
    time.dateTime = post.date;
    meta.appendChild(time);
    meta.appendChild(element("span", "", post.readTime));
    meta.appendChild(element("span", "blog-status", post.status));
    heading.appendChild(meta);
    header.appendChild(heading);
    reader.appendChild(header);

    reader.appendChild(element("p", "blog-reader-intro", post.intro));

    post.sections.forEach(function (section) {
      var block = element("section", "blog-reader-section");
      block.appendChild(element("h3", "", section.heading));
      section.paragraphs.forEach(function (paragraph) {
        block.appendChild(element("p", "", paragraph));
      });
      reader.appendChild(block);
    });

    var takeaway = element("aside", "blog-takeaway");
    takeaway.appendChild(element("span", "blog-takeaway-label", "From the forge"));
    takeaway.appendChild(element("p", "", post.takeaway));
    reader.appendChild(takeaway);

    if (post.productUrl) {
      var actions = element("div", "blog-reader-actions");
      var productLink = element("a", "btn btn-primary", post.productLabel);
      productLink.href = post.productUrl;
      actions.appendChild(productLink);
      reader.appendChild(actions);
    }

    var index = posts.findIndex(function (candidate) { return candidate.slug === post.slug; });
    newerButton.disabled = index <= 0;
    newerButton.dataset.target = index > 0 ? posts[index - 1].slug : "";
    olderButton.disabled = index >= posts.length - 1;
    olderButton.dataset.target = index < posts.length - 1 ? posts[index + 1].slug : "";

    document.title = post.title + " - DEV Blog - Forged By Fire Software LLC";
    renderRecent();

    if (shouldFocus) {
      reader.setAttribute("tabindex", "-1");
      reader.focus({ preventScroll: true });
      reader.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function selectFromHash(shouldFocus) {
    var slug = window.location.hash.slice(1);
    var post = posts.find(function (candidate) { return candidate.slug === slug; }) || posts[0];
    if (window.location.hash !== "#" + post.slug) {
      history.replaceState(null, "", "#" + post.slug);
    }
    renderReader(post, shouldFocus);
  }

  filterBar.addEventListener("click", function (event) {
    var button = event.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    renderFilters();
    renderArchive();
  });

  document.addEventListener("click", function (event) {
    var link = event.target.closest("[data-blog-slug]");
    if (!link) return;
    var slug = link.dataset.blogSlug;
    if (window.location.hash === "#" + slug) {
      event.preventDefault();
      var post = posts.find(function (candidate) { return candidate.slug === slug; });
      if (post) renderReader(post, true);
    }
  });

  [olderButton, newerButton].forEach(function (button) {
    button.addEventListener("click", function () {
      if (!button.dataset.target) return;
      window.location.hash = button.dataset.target;
    });
  });

  window.addEventListener("hashchange", function () { selectFromHash(true); });

  renderFilters();
  renderArchive();
  selectFromHash(false);
})();
