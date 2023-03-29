/* global hexo */

"use strict";

const path = require("path");
const { iconText } = require("./common");

const warn = (...args) => {
  hexo.log.warn(
    `Since ${args[0]} is turned on, the ${args[1]} is disabled to avoid potential hazards.`
  );
};

// Add comment
hexo.extend.filter.register("theme_inject", (injects) => {
  const config = hexo.theme.config.waline;
  if (!config.enable || !config.serverURL) return;

  injects.comment.raw(
    "waline",
    '<div class="comments" id="waline"></div>',
    {},
    { cache: true }
  );

  injects.bodyEnd.file(
    "waline",
    path.join(hexo.theme_dir, "layout/_third-party/comments/waline.njk")
  );

  injects.head.raw(
    "waline",
    `<link rel="dns-prefetch" href="${config.serverURL}">`,
    {},
    {}
  );
  injects.head.raw(
    "waline",
    `<link rel="stylesheet" href="${config.cssUrl}">`,
    {},
    {}
  );
});

// Add post_meta
hexo.extend.filter.register("theme_inject", (injects) => {
  const config = hexo.theme.config.waline;
  if (!config.enable || !config.serverURL) return;

  injects.postMeta.raw(
    "waline_comments",
    `
  {% if post.comments and (is_post() or config.waline.commentCount) %}
  <span class="post-meta-item">
    ${iconText("far fa-comment", "评论数")}
    <a title="评论数" href="{{ url_for(post.path) }}#waline" itemprop="discussionUrl">
      <span class="post-comments-count waline-comment-count" data-path="{{ url_for(post.path) }}" itemprop="commentCount"></span>
    </a>
  </span>
  {% endif %}
  `,
    {},
    {}
  );

  if (config.pageview) {
    // ensure to turn of valine visitor
    if (
      hexo.theme.config.leancloud_visitors &&
      hexo.theme.config.leancloud_visitors.enable
    ) {
      warn("waline.pageview", "leancloud_visitors");
      hexo.theme.config.leancloud_visitors.enable = false;

      return;
    }

    injects.postMeta.raw(
      "waline_pageview",
      `
    <span class="post-meta-item" title="{{ __('post.views') }}">
      <span class="post-meta-item-icon">
        <i class="far fa-eye"></i>
      </span>
      <span class="post-meta-item-text">{{ __('post.views') + __('symbol.colon') }}</span>
      <span class="waline-pageview-count" data-path="{{ url_for(post.path) }}"></span>
    </span>
  `,
      {},
      {}
    );
  }
});
