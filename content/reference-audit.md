# Gabriel Veres: source-derived reference audit

Live URL: https://www.gabrielveres.com/
Fetched public HTML, CSS and JavaScript on 2026-10-16. This report audits deployed source, not the owner's original source project. Browser screenshots and interaction observations are handled separately.

## Structure and platform
- Next.js App Router / React, Tailwind-generated CSS, Framer Motion, React Three Fiber/Three.js, GSAP-backed custom cursor, Lenis and virtual-scroll. Sanity supplies published page data.
- Home contains one viewport-filling ProjectsOverview section (`100svh`) with an infinite perspective WebGL image gallery; it is not a conventional long scrolling page. Fixed desktop navigation at top 36px, fixed footer email at bottom 44px desktop / 24px mobile, Overview/Index switch bottom 38px desktop / 20px mobile.
- Navigation: Home `/`, Work `/projects`, About `/about`, Blog `/blog`, Contact `/contact`. Index also links `/projects`. Project cards link `/projects/[slug]`.
- Home project slugs present in serialized data include xylo, society-studios, divino-harrogate, one38, 1-st-pauls-place, the-wild-hare, bark, better-angels-ventures, a-touch-of-ink. Those are reference-only content, not assets/copy to reuse.

## Fonts and type (verified CSS)
- Base is FK Display, declared as generated `__fkDisplay_9aebc6`, normal weight 400. FK Display family naming is inferred from its actual Next font variable `--font-fk-display`, not font metadata.
- Supporting text is Mabry, generated `__mabry_c4a60f`, normal weights 400 and 500. Both use local Arial metric-adjusted fallbacks and `font-display:swap`.
- Base body weight 400; `font-kerning:none`; smoothing antialiased. No project-specific letter-spacing rule was found, so normal tracking is the verified default.
- Root rem scales with viewport: <=768px `calc(.4998370273794003rem + .2607561929595828vw)`; 769..1620px `calc(.44366197183098594rem + .11737089201877934vw)`; >1620px `calc(-.17499999999999993rem + .6666666666666666vw)`. In root font-size calculations rem refers to browser initial font size, usually 16px. At 1440px root is approximately 8.7887px; at 768px 10px; at 390px 9.0143px.
- Actual home roles: nav labels 1.6rem / 1.1; name 2.2rem / 1, uppercase, Mabry; name tooltip 1.6rem; Overview 1.6rem / 1, Mabry, opacity .6; clock 1.6rem / .9; footer 1.6rem mobile -> 1.8rem desktop, line-height 1.1; mobile menu 5.2rem / 1.2 uppercase.
- Available CSS type sizes (not all used home): 1.2,1.4,1.6,1.7,1.8,1.9,2,2.2,2.6,2.8,3,3.2,3.4,3.6,3.8,4.2,4.6,5.2,30rem; md includes 2.3,2.4,4,4.4,4.8,5.7,6.6,6.8rem. Line-height classes .8,.9,1,1.1,1.2,1.3,1.4.

## Colors, geometry, imagery
- Tokens: color-1 #fff; color-2 #000; color-3 #ddfa42; color-4 rgba(0,0,0,.8); color-5 white .1; color-6 white .6; color-7 white .8; color-8 black .6.
- Main canvas black. html/body background acid yellow. White typography, dim neutral pills, yellow hover/accent.
- Horizontal container padding 2.4rem mobile; 4.8rem from 768px; 6.2rem from 1280px. Home itself uses full width. Named max-width utilities: 179.5rem,146rem,113.2rem,152rem.
- Tailwind media breakpoints in bundle: 640,768,1024,1280,1536,1620,1920px. Desktop header starts 768px. Home card pointer interactions disabled below 1024px; custom cursor hidden <=1280px or no-hover.
- Header flex gap .6rem; right controls .8rem; footer gap 1.6rem; switch gap 2.4rem. No page-level column grid is used by home gallery; geometry is WebGL.
- Pills radius 10rem, nav x padding 1.8rem, top 1.05rem / bottom 1rem; circle radius 50%; blur 8px. Other CSS has 4px imagery radius, but home gallery itself is rectangular 3D geometry.
- Top/bottom black gradient overlays occupy 15% viewport height. Top gradient: transparent at 15.2%, black .5 at 51%, black .85 at 84.8%; bottom reverses with .85 at 9.5%, .5 at 51%, transparent at 84.8%.
- No decorative card shadow in home shader. Shader performs rectangular vignette with `vig = pow(uv.x * uv.y * 35, .60)` after `uv *= 1.0 - uv.yx`, alpha mixed from .75 to 1. Images requested from Sanity at width 500px. Cards preserve source aspect ratio, geometry depth .0075, y rotation -PI/2. Perspective camera fov15, near .1, far20, position[-5.9,3,3.4].

## Verified motion inventory
Timings below are app-level explicit settings. Missing explicit timings are called out rather than attributed an assumed library default.

1. Gallery load: group x starts at 6 and moves to `-(.5338157894736841 * count / 2)`; duration 2s; delay .2s; ease cubic-bezier(.65,0,.35,1). Trigger is final gallery texture load, guarded once.
2. Gallery wheel/touch: virtual-scroll touchMultiplier20, keyboard keyStep810. Every frame `position = lerp(position, -.0005 * virtualScrollY, .1)`. Cards are recycled indefinitely after .5338157894736841 unit travel. This is frame-based damped motion, no duration/easing curve or autoplay loop.
3. Card hover desktop: image z -> .65, .5s, cubic-bezier(.83,0,.17,1). Pointer leave z -> 0, .35s, cubic-bezier(.65,0,.35,1). Cursor gets project title; click sound volume .8. Click routes to project.
4. Navigation/pill label hover: first text y 0 -> -150%; duplicate text y105% -> 0 (main CTA uses 100%). .45s, cubic-bezier(.68,-.6,.32,1.6), no explicit stagger. Pill color transition .35s (CSS default curve cubic-bezier(.4,0,.2,1)); CTA color .45s.
5. Main CTA arrow hover: right arrow right -3.8rem -> 0, .45s; left arrow left0 -> -3.8rem, .45s delay .1s; same overshoot ease. Goo filter static Gaussian blur4 and matrix; geometry uses left/right and is unsuitable for user's transform-only adaptation.
6. Header load/page state: opacity0/y-100 -> opacity1/y0. Footer and Overview/Index opacity0/y100 -> opacity1/y0. No explicit transition duration is supplied at these component variants; do not claim one. Non-home transition state clears after1300ms; home state clears1000ms after loading reaches100%.
7. Loading overlay: opacity fade .3s; progress scaleX uses spring stiffness1000,damping100,mass1.
8. Navigation route transition: outgoing document opacity1 -> 0 and translateY0 -> -35%; incoming document revealed by polygon clip-path from bottom. Both1200ms cubic-bezier(.87,0,.13,1). Adaptation must avoid animated clip-path per user constraint.
9. Desktop name hover: tooltip opacity0->1 and y-50% ->80%, x-50%; transform spring duration .6s, opacity .15s linear. Name tooltip is rounded translucent blur8px.
10. Desktop clock hover: width0 ->8rem over .25s; no explicit ease. Adaptation should use transform/opacity instead of width.
11. Desktop home icon hover: rotate360; no explicit transition duration. Colors .35s.
12. Mobile menu open: backdrop opacity0->1 over1.2s cubic-bezier(.87,0,.13,1), children delayed .8s and stagger .07s. Links opacity0/y105% -> opacity1/y0 over .4s (no explicit ease). Bottom contact CTA opacity enters .6s after1.2s. Closing variants do not explicitly define durations.
13. Footer text underline hover: scaleX0->1 from bottom left,250ms, ease-in-out-quad cubic-bezier(.455,.03,.515,.955). CSS underline positioned -.25rem below; thickness1px.
14. Cursor trail: 15 recent pointer positions, rAF updates, acid-yellow2px rounded stroke; desktop >=1024px; mounts after300ms. SVG opacity .3s with .2s delay easeInOut on pointer reentry/leave.
15. Custom cursor: opacity .3s/color .4s; circle border/shadow/transform .25s ease-in-out, opacity .1s. Cursor text opacity .4s, transform .3s, starts scale0 rotate10deg. Cursor label is Mabry2rem/100%.
16. Scroll indicator click uses smooth scroll2s, easing min(1,1.001 - 2^(-10t)). Scrollbar not meaningful for the single-viewport home; appears on other longer routes.

## Boundaries
### Supplied reference-image measurements

The downloaded Craftwork reference image is 1440×1080. Pixel-threshold measurements within isolated control regions (not estimates of CSS boxes) give: left nav pills x56–303/y36–69; center name x644–796/y47–60, centered exactly at x720; footer email x55–188/y1017–1031; Index pill x1316–1386/y1009–1042. Visible horizontal margins are approximately 3.8% of image width, and the Index pill bottom margin is 38px. Font glyph bounds are smaller than line boxes. These measurements corroborate the source-derived container and header/footer alignment; the implementation uses 54.7px gutters at 1440px, a centered wordmark and a 44px minimum control height for accessibility.

- Home and nav CSS/JS are verified. Full inner-page content/style/motion is not audited in this report.
- Source has no universal reduced-motion handling evident in app-level gallery/nav code; stylesheet only gates custom scroller using html.has-reduced-motion. Rebuild should improve accessibility rather than duplicate these limitations.
- All reference branding, names, copy, imagery and custom fonts are reference evidence only. Use original project content and licensed/system alternatives for the implementation.

## Local evidence
index.html; 4bcd59accba7cea4.css; css-readable.txt; page-7f0a7120f50f3ebb.js; layout-5761c08d56e768a0.js; 8635.80ce73395dfc772c.js (desktop nav); 7674.94114d09fb271cb3.js (mobile nav); webpack-08d24b97171362e4.js; browser home-1440/768/390.json collected by root agent.
