/* @ds-bundle: {"format":3,"namespace":"ARSENOVADesignSystem_f0252d","components":[{"name":"PostCard","sourcePath":"components/blog/PostCard.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CategoryTag","sourcePath":"components/core/CategoryTag.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"}],"sourceHashes":{"components/blog/PostCard.jsx":"61ca58378625","components/brand/Logo.jsx":"7e2ba348d45c","components/core/Button.jsx":"c7e7af0e0e40","components/core/Card.jsx":"3f90cf49d620","components/core/CategoryTag.jsx":"a3c15199e71f","components/core/Input.jsx":"f369f5c8a331","components/navigation/NavItem.jsx":"5d731dd3d534","ui_kits/arsenova-blog/ArticleView.jsx":"bae64b6919e2","ui_kits/arsenova-blog/HomeView.jsx":"41fc09114026","ui_kits/arsenova-blog/Sidebar.jsx":"d5bd300e1ebb","ui_kits/arsenova-blog/posts.js":"9dada135b8cd"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ARSENOVADesignSystem_f0252d = window.ARSENOVADesignSystem_f0252d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ARSENOVA Logo — the cream "A" mark (inline SVG, so it travels without an
 * asset dependency) plus optional wordmark + caption. The mark = parchment "A"
 * on deep-plum plate, crimson underline bar and a comet spark.
 */
function Logo({
  size = 34,
  wordmark = true,
  caption = "私人传输",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.6em",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 160 160",
    role: "img",
    "aria-label": "ARSENOVA",
    style: {
      flexShrink: 0,
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("rect", {
    width: "160",
    height: "160",
    rx: "34",
    fill: "var(--brand-ink, #120f14)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M24 113 69 22h25l43 91h-25l-8-19H58l-8 19H24Z",
    fill: "var(--brand-cream, #f4ead7)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M66 76h31L82 40 66 76Z",
    fill: "var(--brand-ink, #120f14)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M29 126h100l9 12H20l9-12Z",
    fill: "var(--brand-red, #d92332)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M116 28 139 17l-9 29-7-9-24 20-7-8 24-21Z",
    fill: "var(--brand-red, #d92332)"
  })), wordmark && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "1.05rem",
      fontWeight: 400,
      letterSpacing: "0.06em",
      color: "var(--c-text)"
    }
  }, "ARSENOVA"), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-heading)",
      fontSize: "0.7rem",
      letterSpacing: "0.18em",
      color: "var(--c-text-3)"
    }
  }, caption)));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ARSENOVA Button — soft-cornered action. Crimson primary, quiet neutral
 * secondary, and a borderless ghost. Optional leading Tabler icon.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  block = false,
  disabled = false,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "0.34em 0.8em",
      fontSize: "var(--text-sm)",
      gap: "0.4em"
    },
    md: {
      padding: "0.5em 1.1em",
      fontSize: "var(--text-base)",
      gap: "0.5em"
    },
    lg: {
      padding: "0.66em 1.5em",
      fontSize: "var(--text-md)",
      gap: "0.55em"
    }
  };
  const variants = {
    primary: {
      background: "var(--c-primary)",
      color: "#fff",
      boxShadow: "var(--box-shadow-1)"
    },
    secondary: {
      background: "var(--c-bg-2)",
      color: "var(--c-text-1)",
      border: "1px solid var(--c-border)"
    },
    ghost: {
      background: "transparent",
      color: "var(--c-text-2)"
    },
    soft: {
      background: "var(--c-primary-soft)",
      color: "var(--c-primary)"
    }
  };
  const base = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    gap: sizes[size].gap,
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fw-medium)",
    lineHeight: 1.2,
    letterSpacing: "var(--tracking-body)",
    borderRadius: "var(--radius)",
    cornerShape: "superellipse(1.2)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "transform .2s, background-color .2s, box-shadow .2s, opacity .2s",
    WebkitTapHighlightColor: "transparent",
    ...sizes[size],
    ...variants[variant],
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    style: base,
    onMouseDown: e => !disabled && (e.currentTarget.style.transform = "translateY(1px)"),
    onMouseUp: e => e.currentTarget.style.transform = "",
    onMouseLeave: e => e.currentTarget.style.transform = ""
  }, rest), icon && /*#__PURE__*/React.createElement("iconify-icon", {
    icon: icon,
    "aria-hidden": "true",
    style: {
      fontSize: "1.15em"
    }
  }), children && /*#__PURE__*/React.createElement("span", null, children), iconRight && /*#__PURE__*/React.createElement("iconify-icon", {
    icon: iconRight,
    "aria-hidden": "true",
    style: {
      fontSize: "1.15em"
    }
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ARSENOVA Card — the canonical surface: white/raised plate, soft superellipse
 * corners, whisper shadow. `upraise` lifts 2px on hover; `gradient` reveals a
 * crimson gradient border on hover (the site's "gradient-card").
 */
function Card({
  children,
  upraise = false,
  gradient = false,
  padding = "1.25rem",
  as = "div",
  style,
  ...rest
}) {
  const Tag = as;
  const [hover, setHover] = React.useState(false);
  const base = {
    position: "relative",
    display: "block",
    padding,
    borderRadius: "var(--radius)",
    cornerShape: "superellipse(1.2)",
    background: "var(--ld-bg-card)",
    boxShadow: "var(--box-shadow-1)",
    border: "1px solid var(--c-border)",
    transition: "transform .2s, box-shadow .2s, border-color .2s",
    transform: upraise && hover ? "translateY(-2px)" : "none",
    ...style
  };
  if (gradient) {
    base.border = "2px solid transparent";
    base.backgroundImage = hover ? "linear-gradient(var(--ld-bg-card), var(--ld-bg-card)) padding-box, linear-gradient(45deg, var(--c-primary), var(--c-primary-soft)) border-box" : "linear-gradient(var(--ld-bg-card), var(--ld-bg-card)) padding-box, linear-gradient(45deg, transparent, transparent) border-box";
  }
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: base,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/CategoryTag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CAT = {
  技术: {
    color: "var(--cat-tech)",
    icon: "tabler:mouse"
  },
  开发: {
    color: "var(--cat-dev)",
    icon: "tabler:code"
  },
  安全: {
    color: "var(--cat-sec)",
    icon: "tabler:bug"
  },
  杂谈: {
    color: "var(--cat-talk)",
    icon: "tabler:message"
  },
  生活: {
    color: "var(--cat-life)",
    icon: "tabler:leaf"
  }
};

/**
 * ARSENOVA CategoryTag — the article-taxonomy chip. Each category carries its
 * own accent + Tabler icon (lifted from blog.config). Use `tone="soft"` for a
 * tinted pill, `tone="dot"` for an inline label with a colored dot.
 */
function CategoryTag({
  category = "技术",
  tone = "soft",
  icon,
  color,
  children,
  style,
  ...rest
}) {
  const meta = CAT[category] || {
    color: color || "var(--c-primary)",
    icon: icon || "tabler:tag"
  };
  const accent = color || meta.color;
  const label = children || category;
  if (tone === "dot") {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4em",
        fontSize: "var(--text-sm)",
        color: "var(--c-text-2)",
        fontFamily: "var(--font-heading)",
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: accent
      }
    }), label);
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.34em",
      padding: "0.2em 0.6em",
      fontSize: "var(--text-sm)",
      fontFamily: "var(--font-heading)",
      fontWeight: "var(--fw-medium)",
      lineHeight: 1.4,
      borderRadius: "var(--radius-pill)",
      color: accent,
      background: `color-mix(in srgb, ${accent} 12%, transparent)`,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("iconify-icon", {
    icon: icon || meta.icon,
    "aria-hidden": "true",
    style: {
      fontSize: "1.05em"
    }
  }), label);
}
Object.assign(__ds_scope, { CategoryTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CategoryTag.jsx", error: String((e && e.message) || e) }); }

// components/blog/PostCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ARSENOVA PostCard — a feed entry. Two layouts: "row" (meta + title +
 * excerpt, optional thumbnail right) and "cover" (full-bleed image header).
 * Composes CategoryTag for the taxonomy chip.
 */
function PostCard({
  title = "未命名文章",
  excerpt,
  category = "技术",
  date,
  readTime,
  cover,
  layout = "row",
  href = "#",
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Meta = () => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.8em",
      flexWrap: "wrap",
      fontSize: "var(--text-sm)",
      color: "var(--c-text-3)",
      fontFamily: "var(--font-heading)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.CategoryTag, {
    category: category
  }), date && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35em"
    }
  }, /*#__PURE__*/React.createElement("iconify-icon", {
    icon: "tabler:calendar"
  }), date), readTime && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35em"
    }
  }, /*#__PURE__*/React.createElement("iconify-icon", {
    icon: "tabler:clock"
  }), readTime));
  const wrap = {
    display: "block",
    position: "relative",
    borderRadius: "var(--radius)",
    cornerShape: "superellipse(1.2)",
    background: "var(--ld-bg-card)",
    border: "1px solid var(--c-border)",
    boxShadow: hover ? "var(--box-shadow-2)" : "var(--box-shadow-1)",
    transform: hover ? "translateY(-2px)" : "none",
    transition: "transform .2s, box-shadow .2s, border-color .2s",
    overflow: "hidden",
    ...style
  };
  if (layout === "cover") {
    return /*#__PURE__*/React.createElement("a", _extends({
      href: href,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: wrap
    }, rest), cover && /*#__PURE__*/React.createElement("div", {
      style: {
        aspectRatio: "16 / 9",
        overflow: "hidden",
        background: "var(--c-bg-3)"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: cover,
      alt: "",
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: hover ? "scale(1.04)" : "scale(1)",
        transition: "transform .4s var(--ease-to-full)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "1.1rem 1.25rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6em"
      }
    }, /*#__PURE__*/React.createElement(Meta, null), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontFamily: "var(--font-heading)",
        fontWeight: "var(--fw-creative)",
        fontSize: "var(--text-lg)",
        color: "var(--c-text)",
        lineHeight: "var(--lh-snug)"
      }
    }, title), excerpt && /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: "var(--text-base)",
        color: "var(--c-text-2)",
        lineHeight: "var(--lh-snug)",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      }
    }, excerpt)));
  }
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...wrap,
      display: "flex",
      gap: "1.25rem",
      padding: "1.1rem 1.25rem",
      alignItems: "stretch"
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: "0.55em"
    }
  }, /*#__PURE__*/React.createElement(Meta, null), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-heading)",
      fontWeight: "var(--fw-creative)",
      fontSize: "var(--text-lg)",
      color: "var(--c-text)",
      lineHeight: "var(--lh-snug)"
    }
  }, title), excerpt && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-base)",
      color: "var(--c-text-2)",
      lineHeight: "var(--lh-snug)",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    }
  }, excerpt)), cover && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 132,
      flexShrink: 0,
      borderRadius: "var(--radius-sm)",
      overflow: "hidden",
      background: "var(--c-bg-3)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: cover,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  })));
}
Object.assign(__ds_scope, { PostCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/blog/PostCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ARSENOVA Input — quiet inset field. Optional leading Tabler icon. Focus
 * raises a crimson hairline ring. Works for search bars and forms alike.
 */
function Input({
  icon,
  type = "text",
  value,
  defaultValue,
  placeholder,
  onChange,
  disabled,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.55em",
      padding: "0.5em 0.8em",
      background: "var(--c-bg-2)",
      borderRadius: "var(--radius)",
      cornerShape: "superellipse(1.2)",
      border: `1px solid ${focus ? "var(--c-primary)" : "var(--c-border)"}`,
      boxShadow: focus ? "0 0 0 3px var(--c-primary-soft)" : "none",
      transition: "border-color .2s, box-shadow .2s",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("iconify-icon", {
    icon: icon,
    "aria-hidden": "true",
    style: {
      fontSize: "1.15em",
      color: "var(--c-text-3)"
    }
  }), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-basic)",
      fontSize: "var(--text-base)",
      color: "var(--c-text-1)",
      letterSpacing: "var(--tracking-body)"
    }
  }, rest)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ARSENOVA NavItem — a left-rail navigation row. Tabler icon + label, with an
 * active state that fills with primary-soft and tints the icon/label crimson.
 */
function NavItem({
  icon = "tabler:circle",
  children,
  active = false,
  href = "#",
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.7em",
      padding: "0.5em 0.7em",
      borderRadius: "var(--radius)",
      cornerShape: "superellipse(1.2)",
      fontFamily: "var(--font-heading)",
      fontSize: "var(--text-base)",
      fontWeight: active ? "var(--fw-medium)" : "var(--fw-regular)",
      color: active ? "var(--c-primary)" : hover ? "var(--c-text-1)" : "var(--c-text-2)",
      background: active ? "var(--ld-bg-active)" : hover ? "var(--c-bg-2)" : "transparent",
      transition: "background-color .2s, color .2s",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("iconify-icon", {
    icon: icon,
    "aria-hidden": "true",
    style: {
      fontSize: "1.25em"
    }
  }), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arsenova-blog/ArticleView.jsx
try { (() => {
/* ARSENOVA blog — article reading view. Header (category + title + meta),
 * optional cover, prose body that switches serif for "story" posts. */
const {
  Button,
  CategoryTag
} = window.ARSENOVADesignSystem_f0252d;
function ArticleView({
  post,
  onBack
}) {
  const serif = !!post.story;
  const proseFont = serif ? "var(--font-serif)" : "var(--font-basic)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--content-max)",
      margin: "0 auto",
      padding: "2rem var(--gutter) 5rem",
      animation: "float-in .3s both"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    icon: "tabler:arrow-left",
    onClick: onBack,
    style: {
      marginLeft: "-0.6em",
      marginBottom: "1.25rem"
    }
  }, "\u8FD4\u56DE"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.9em",
      flexWrap: "wrap",
      marginBottom: "0.9rem"
    }
  }, /*#__PURE__*/React.createElement(CategoryTag, {
    category: post.category
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35em",
      fontSize: "var(--text-sm)",
      color: "var(--c-text-3)",
      fontFamily: "var(--font-heading)"
    }
  }, /*#__PURE__*/React.createElement("iconify-icon", {
    icon: "tabler:calendar"
  }), post.date), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35em",
      fontSize: "var(--text-sm)",
      color: "var(--c-text-3)",
      fontFamily: "var(--font-heading)"
    }
  }, /*#__PURE__*/React.createElement("iconify-icon", {
    icon: "tabler:clock"
  }), post.readTime)), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "0 0 1.5rem",
      fontFamily: serif ? "var(--font-serif)" : "var(--font-heading)",
      fontWeight: serif ? 600 : 550,
      fontSize: "var(--text-2xl)",
      lineHeight: "var(--lh-tight)",
      color: "var(--c-text)",
      letterSpacing: "0.012em"
    }
  }, post.title), !serif && post.cover && /*#__PURE__*/React.createElement("img", {
    src: post.cover,
    alt: "",
    style: {
      width: "100%",
      borderRadius: "var(--radius)",
      border: "1px solid var(--c-border)",
      boxShadow: "var(--box-shadow-1)",
      marginBottom: "1.75rem",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("article", {
    style: {
      fontFamily: proseFont,
      fontSize: serif ? "1.0625rem" : "var(--text-md)",
      lineHeight: "var(--lh-body)",
      color: "var(--c-text-1)",
      letterSpacing: "var(--tracking-body)"
    }
  }, post.body.map((b, i) => {
    if (b.t === "h") return /*#__PURE__*/React.createElement("h2", {
      key: i,
      style: {
        margin: "2rem 0 0.75rem",
        fontFamily: "var(--font-heading)",
        fontWeight: 550,
        fontSize: "var(--text-xl)",
        color: "var(--c-text)",
        display: "flex",
        alignItems: "center",
        gap: "0.5em"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--c-primary)",
        fontFamily: "var(--font-monospace)",
        fontSize: "0.7em"
      }
    }, "##"), b.v);
    if (b.t === "code") return /*#__PURE__*/React.createElement("pre", {
      key: i,
      style: {
        margin: "1.25rem 0",
        padding: "1rem 1.1rem",
        background: "var(--c-bg-2)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--radius)",
        overflow: "auto",
        fontFamily: "var(--font-monospace)",
        fontSize: "0.875rem",
        lineHeight: 1.7,
        color: "var(--c-text-1)"
      }
    }, b.v);
    return /*#__PURE__*/React.createElement("p", {
      key: i,
      style: {
        margin: "0 0 1.1rem"
      }
    }, b.v);
  })), /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: "2.5rem",
      paddingTop: "1.5rem",
      borderTop: "1px solid var(--c-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--c-text-3)",
      fontFamily: "var(--font-monospace)"
    }
  }, "CC BY-NC-SA 4.0 \xB7 ARSENOVA"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.6rem"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    size: "sm",
    icon: "tabler:heart"
  }, "\u559C\u6B22"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    icon: "tabler:share-2"
  }, "\u5206\u4EAB"))));
}
window.ArticleView = ArticleView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arsenova-blog/ArticleView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arsenova-blog/HomeView.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ARSENOVA blog — home feed view. Hero excerpt + search, a featured cover
 * post, then the row list. Composes PostCard + Input + CategoryTag. */
const {
  PostCard,
  Input,
  CategoryTag
} = window.ARSENOVADesignSystem_f0252d;
function HomeView({
  onOpen
}) {
  const posts = window.ARSENOVA_POSTS;
  const featured = posts.find(p => p.featured) || posts[0];
  const rest = posts.filter(p => p.id !== featured.id);
  const cats = ["技术", "开发", "安全", "杂谈", "生活"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--feed-max)",
      margin: "0 auto",
      padding: "2.5rem var(--gutter) 4rem",
      animation: "float-in .3s both"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      marginBottom: "2.25rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      color: "var(--c-text)",
      letterSpacing: "0.03em",
      lineHeight: 1.15
    }
  }, "\u4EE3\u7801\u3001\u751F\u6D3B\u3001\u7B14\u8BB0", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--c-primary)"
    }
  }, "\u4E0E\u591C\u8C08")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0.75rem 0 0",
      maxWidth: 560,
      fontSize: "var(--text-md)",
      color: "var(--c-text-2)",
      lineHeight: "var(--lh-snug)"
    }
  }, "\u8BB0\u5F55\u751F\u6D3B\u3001\u60C5\u7EEA\u3001\u97F3\u4E50\u3001\u57CE\u5E02\u548C\u4E00\u4E9B\u6CA1\u8BF4\u51FA\u53E3\u7684\u60F3\u6CD5\uFF0C\u8FD8\u6709\u56DE\u5FC6\u5F55\u3002", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-monospace)",
      color: "var(--c-text-3)"
    }
  }, "\u2014\u2014 \u79C1\u4EBA\u4F20\u8F93 _")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.75rem",
      alignItems: "center",
      marginTop: "1.5rem",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: "tabler:search",
    placeholder: "\u641C\u7D22\u6587\u7AE0\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, cats.map(c => /*#__PURE__*/React.createElement(CategoryTag, {
    key: c,
    category: c
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.6em",
      margin: "0 0 1rem",
      fontSize: "var(--text-sm)",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--c-text-3)",
      fontFamily: "var(--font-heading)"
    }
  }, /*#__PURE__*/React.createElement("iconify-icon", {
    icon: "tabler:flame"
  }), " \u7CBE\u9009"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "2.25rem"
    }
  }, /*#__PURE__*/React.createElement(PostCard, _extends({
    layout: "cover"
  }, featured, {
    onClick: e => {
      e.preventDefault();
      onOpen(featured.id);
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.6em",
      margin: "0 0 1rem",
      fontSize: "var(--text-sm)",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--c-text-3)",
      fontFamily: "var(--font-heading)"
    }
  }, /*#__PURE__*/React.createElement("iconify-icon", {
    icon: "tabler:notes"
  }), " \u6700\u8FD1\u66F4\u65B0"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    }
  }, rest.map(p => /*#__PURE__*/React.createElement(PostCard, _extends({
    key: p.id
  }, p, {
    cover: p.story ? undefined : p.cover,
    onClick: e => {
      e.preventDefault();
      onOpen(p.id);
    }
  })))));
}
window.HomeView = HomeView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arsenova-blog/HomeView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arsenova-blog/Sidebar.jsx
try { (() => {
/* ARSENOVA blog UI kit — left rail shell. Composes Logo + NavItem from the
 * design system, adds the footer icon nav and a 3-way theme switch. */
const {
  Logo,
  NavItem
} = window.ARSENOVADesignSystem_f0252d;
const NAV = [{
  icon: "tabler:home",
  text: "主页",
  key: "home"
}, {
  icon: "tabler:notes",
  text: "文章",
  key: "notes"
}, {
  icon: "tabler:cpu-2",
  text: "技术",
  key: "tech"
}, {
  icon: "tabler:moon-stars",
  text: "生活",
  key: "life"
}, {
  icon: "tabler:archive",
  text: "归档",
  key: "archive"
}, {
  icon: "tabler:user-circle",
  text: "关于",
  key: "about"
}];
function ThemeSwitch({
  theme,
  setTheme
}) {
  const opts = [{
    k: "light",
    icon: "tabler:sun"
  }, {
    k: "system",
    icon: "tabler:device-desktop"
  }, {
    k: "dark",
    icon: "tabler:moon"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 2,
      padding: 3,
      background: "var(--c-bg-2)",
      borderRadius: "var(--radius)",
      cornerShape: "superellipse(1.2)"
    }
  }, opts.map(o => {
    const on = theme === o.k;
    return /*#__PURE__*/React.createElement("button", {
      key: o.k,
      onClick: () => setTheme(o.k),
      title: o.k,
      style: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        padding: "0.4em 0",
        borderRadius: "calc(var(--radius) - 3px)",
        color: on ? "var(--c-primary)" : "var(--c-text-3)",
        background: on ? "var(--ld-bg-card)" : "transparent",
        boxShadow: on ? "var(--box-shadow-1)" : "none",
        transition: "color .2s, background .2s"
      }
    }, /*#__PURE__*/React.createElement("iconify-icon", {
      icon: o.icon,
      style: {
        fontSize: "1.2em"
      }
    }));
  }));
}
function Sidebar({
  active,
  onNav,
  theme,
  setTheme
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: "var(--sidebar-w)",
      flexShrink: 0,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      padding: "1.5rem 1rem",
      borderRight: "1px solid var(--c-border)",
      background: "var(--c-bg-1)",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 0.4rem",
      cursor: "pointer"
    },
    onClick: () => onNav("home")
  }, /*#__PURE__*/React.createElement(Logo, null)), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      marginTop: 4
    }
  }, NAV.map(n => /*#__PURE__*/React.createElement(NavItem, {
    key: n.key,
    icon: n.icon,
    active: active === n.key,
    onClick: e => {
      e.preventDefault();
      onNav(n.key);
    }
  }, n.text))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "0.9rem"
    }
  }, /*#__PURE__*/React.createElement(ThemeSwitch, {
    theme: theme,
    setTheme: setTheme
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      padding: "0 0.2rem"
    }
  }, [{
    icon: "tabler:brand-github",
    url: "#"
  }, {
    icon: "tabler:rss",
    url: "#"
  }, {
    icon: "tabler:mail",
    url: "#"
  }].map((s, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: s.url,
    style: {
      display: "flex",
      padding: "0.4em",
      borderRadius: "var(--radius)",
      color: "var(--c-text-3)"
    },
    onMouseEnter: e => e.currentTarget.style.color = "var(--c-primary)",
    onMouseLeave: e => e.currentTarget.style.color = "var(--c-text-3)"
  }, /*#__PURE__*/React.createElement("iconify-icon", {
    icon: s.icon,
    style: {
      fontSize: "1.3em"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      lineHeight: 1.6,
      color: "var(--c-text-3)",
      padding: "0 0.2rem",
      fontFamily: "var(--font-monospace)"
    }
  }, "\xA9 2026 ARSENOVA", /*#__PURE__*/React.createElement("br", null), "arsenova.xyz \xB7 CC BY-NC-SA")));
}
window.Sidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arsenova-blog/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arsenova-blog/posts.js
try { (() => {
/* Sample post data for the ARSENOVA blog UI kit. */
window.ARSENOVA_POSTS = [{
  id: "kmp",
  category: "开发",
  title: "KMP 算法 · 当字符串学会回头看",
  excerpt: "失配时不回退主串指针，而是查 next 数组跳到最长公共前后缀——线性时间 O(n+m) 的优雅，藏在一张前缀表里。",
  date: "2026-03-29",
  readTime: "9 分钟",
  cover: "../../assets/covers/kmp.png",
  featured: true,
  body: [{
    t: "p",
    v: "暴力匹配最让人难受的地方，是每次失配都要把主串指针退回去重来。KMP 的答案很简单：主串指针永不回退，回退的只是模式串。"
  }, {
    t: "h",
    v: "next 数组：模式串的自我认知"
  }, {
    t: "p",
    v: "next[i] 记录的是 P[0..i] 这一段里，最长的、既是前缀又是后缀的子串长度。它本质上是模式串对自己的一次审视——知道自己哪里和开头长得一样。"
  }, {
    t: "code",
    v: "while (j > 0 && P[i] != P[j]) j = next[j-1];\nif (P[i] == P[j]) j++;\nnext[i] = j;"
  }, {
    t: "p",
    v: "构建 next 的过程，其实就是模式串拿自己跟自己做一次 KMP。这种自指的味道，是算法里少有的浪漫。"
  }]
}, {
  id: "runtime",
  category: "技术",
  title: "high-concurrency-runtime · 调度层设计",
  excerpt: "每个工作线程一个本地队列，再加一个全局队列与 work-stealing：先掏自己的，空了再去偷别人的，让核心忙起来而不是排队等待。",
  date: "2026-04-17",
  readTime: "12 分钟",
  cover: "../../assets/covers/leetcode-hot100.png",
  body: [{
    t: "p",
    v: "调度器的第一性原理：别让 CPU 闲着，也别让任务排队等一个忙不过来的线程。本地队列 + work-stealing 是这个矛盾的经典解。"
  }, {
    t: "h",
    v: "本地优先，窃取兜底"
  }, {
    t: "p",
    v: "每个线程优先从自己的双端队列尾部取任务（缓存友好）；空了，就从别的线程队列头部偷一个。两端分离把竞争降到最低。"
  }, {
    t: "code",
    v: "Task* t = local.pop_back();\nif (!t) t = steal_from_random_victim();\nif (!t) t = global.pop();"
  }]
}, {
  id: "hot100",
  category: "开发",
  title: "LeetCode HOT100 · 刷题这件小事",
  excerpt: "把一百道题当成一百次和自己的对话。不是为了背答案，而是为了认出那些反复出现的形状。",
  date: "2026-02-11",
  readTime: "6 分钟",
  cover: "../../assets/covers/leetcode-hot100.png",
  body: [{
    t: "p",
    v: "刷题最大的收益不是 AC 数，而是你开始在陌生题里认出熟悉的骨架：双指针、单调栈、滑动窗口……"
  }]
}, {
  id: "night",
  category: "生活",
  title: "夜里两点，编译器还在转",
  excerpt: "写下这些不是为了谁会读到，而是怕自己忘了——那些没说出口的想法，城市的灯，还有一段段跑通之后的安静。",
  date: "2026-01-30",
  readTime: "4 分钟",
  story: true,
  body: [{
    t: "p",
    v: "屏幕的光是这间屋子里唯一醒着的东西。进度条爬到 87% 又卡住，我盯着它，像盯着一件没法催促的事。"
  }, {
    t: "p",
    v: "后来想，写代码和写日记其实差不多：都是把混乱的东西，一行一行地，排成能跑通的顺序。"
  }]
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arsenova-blog/posts.js", error: String((e && e.message) || e) }); }

__ds_ns.PostCard = __ds_scope.PostCard;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CategoryTag = __ds_scope.CategoryTag;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.NavItem = __ds_scope.NavItem;

})();
