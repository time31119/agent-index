/* =========================================================
   礼序 LIXU — product illustration library
   Every product is drawn as a vector "studio mockup" on a
   1000 × 1000 canvas. The print zone uses the same coordinate
   space so an uploaded logo can be placed with one rule.
   ========================================================= */
(function () {
  "use strict";

  let uidCounter = 0;
  const nextUid = () => `lx${++uidCounter}`;

  function toRgb(hex) {
    let h = String(hex).replace("#", "").trim();
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function mix(a, b, amount) {
    const A = toRgb(a);
    const B = toRgb(b);
    const t = Math.max(0, Math.min(1, amount));
    const r = Math.round(A.r + (B.r - A.r) * t);
    const g = Math.round(A.g + (B.g - A.g) * t);
    const bch = Math.round(A.b + (B.b - A.b) * t);
    return `#${[r, g, bch].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }

  const lighten = (hex, t) => mix(hex, "#ffffff", t);
  const darken = (hex, t) => mix(hex, "#12140f", t);

  function baseDefs(u, c, extra = "") {
    return `<defs>
      <filter id="${u}-shadow" x="-35%" y="-35%" width="170%" height="170%">
        <feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#241e13" flood-opacity=".22"/>
      </filter>
      <filter id="${u}-shadow-soft" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#241e13" flood-opacity=".18"/>
      </filter>
      <filter id="${u}-blur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="16"/>
      </filter>
      <linearGradient id="${u}-body" x1="0" y1="0" x2="1" y2=".15">
        <stop offset="0" stop-color="${darken(c.body, 0.12)}"/>
        <stop offset=".24" stop-color="${lighten(c.body, 0.1)}"/>
        <stop offset=".52" stop-color="${c.body}"/>
        <stop offset=".82" stop-color="${darken(c.body, 0.06)}"/>
        <stop offset="1" stop-color="${darken(c.body, 0.2)}"/>
      </linearGradient>
      <linearGradient id="${u}-side" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${lighten(c.body, 0.08)}"/>
        <stop offset="1" stop-color="${darken(c.body, 0.26)}"/>
      </linearGradient>
      <pattern id="${u}-weave" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" stroke="${darken(c.body, 0.24)}" stroke-width=".8" opacity=".34"/>
      </pattern>
      ${extra}
    </defs>`;
  }

  function svgWrap(u, label, inner) {
    return `<svg class="product-art" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${inner}</svg>`;
  }

  /* ---------------------------------------------------------
     01 · CANVAS TOTE
     --------------------------------------------------------- */
  function toteArt(c) {
    const u = nextUid();
    const body = "M292 390 Q500 368 708 390 L738 790 Q742 844 682 844 L318 844 Q258 844 262 790 Z";
    const clip = `<clipPath id="${u}-bag"><path d="${body}"/></clipPath>`;
    return svgWrap(
      u,
      "原色帆布托特包",
      `${baseDefs(u, c, clip)}
      <ellipse cx="500" cy="858" rx="252" ry="34" fill="#201a12" opacity=".1"/>
      <g filter="url(#${u}-shadow)">
        <path d="M356 404 C356 166 644 166 644 404" fill="none" stroke="${darken(c.dark, 0.08)}" stroke-width="30" stroke-linecap="round"/>
        <path d="M381 404 C381 202 619 202 619 404" fill="none" stroke="${lighten(c.body, 0.06)}" stroke-width="12" stroke-linecap="round" opacity=".65"/>
        <path d="${body}" fill="url(#${u}-body)"/>
        <g clip-path="url(#${u}-bag)">
          <rect x="240" y="350" width="520" height="530" fill="url(#${u}-weave)" opacity=".52"/>
          <path d="M622 380 L716 390 L742 810 L656 848 Z" fill="${darken(c.body, 0.18)}" opacity=".14"/>
          <path d="M280 380 L305 390 L300 846 L270 816 Z" fill="${lighten(c.body, 0.24)}" opacity=".3"/>
          <path d="M292 390 Q500 368 708 390 L712 432 Q500 409 288 432 Z" fill="${darken(c.body, 0.13)}" opacity=".52"/>
          <path d="M288 432 Q500 409 712 432" fill="none" stroke="${lighten(c.body, 0.3)}" stroke-width="3" opacity=".6"/>
          <path d="M318 844 Q500 862 682 844" fill="none" stroke="${darken(c.body, 0.15)}" stroke-width="4" opacity=".5"/>
          <path d="M326 430 L314 836" fill="none" stroke="${darken(c.body, 0.16)}" stroke-width="3" stroke-dasharray="5 7" opacity=".55"/>
          <path d="M674 430 L686 836" fill="none" stroke="${darken(c.body, 0.16)}" stroke-width="3" stroke-dasharray="5 7" opacity=".55"/>
          <path d="M410 620 C450 650 470 734 455 806" fill="none" stroke="${darken(c.body, 0.16)}" stroke-width="3" opacity=".2"/>
          <path d="M590 610 C570 680 580 762 606 826" fill="none" stroke="${lighten(c.body, 0.34)}" stroke-width="8" opacity=".32"/>
        </g>
        <path d="M304 394 Q500 374 696 394" fill="none" stroke="${darken(c.body, 0.1)}" stroke-width="2"/>
        <text x="660" y="808" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="17" letter-spacing="4.5" fill="${darken(c.body, 0.42)}" opacity=".7">12 OZ CANVAS</text>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     02 · CERAMIC MUG
     --------------------------------------------------------- */
  function mugArt(c) {
    const u = nextUid();
    const body = "M300 404 Q300 374 500 374 Q700 374 700 404 L690 690 Q690 770 500 770 Q310 770 310 690 Z";
    const clip = `<clipPath id="${u}-cup"><path d="${body}"/></clipPath>
      <linearGradient id="${u}-glaze" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${darken(c.body, 0.2)}"/>
        <stop offset=".15" stop-color="${c.body}"/>
        <stop offset=".38" stop-color="${lighten(c.body, 0.2)}"/>
        <stop offset=".63" stop-color="${c.body}"/>
        <stop offset=".88" stop-color="${darken(c.body, 0.09)}"/>
        <stop offset="1" stop-color="${darken(c.body, 0.22)}"/>
      </linearGradient>`;
    return svgWrap(
      u,
      "陶瓷马克杯",
      `${baseDefs(u, c, clip)}
      <ellipse cx="500" cy="796" rx="224" ry="38" fill="#211b13" opacity=".12"/>
      <g filter="url(#${u}-shadow)">
        <path d="M664 468 C856 452 866 690 686 696" fill="none" stroke="${darken(c.body, 0.24)}" stroke-width="62" stroke-linecap="round"/>
        <path d="M664 468 C836 462 846 678 686 684" fill="none" stroke="${lighten(c.body, 0.04)}" stroke-width="28" stroke-linecap="round"/>
        <path d="${body}" fill="url(#${u}-glaze)"/>
        <g clip-path="url(#${u}-cup)">
          <path d="M330 430 C310 540 320 640 350 728" fill="none" stroke="${lighten(c.body, 0.38)}" stroke-width="38" opacity=".32" filter="url(#${u}-blur)"/>
          <path d="M636 420 C662 520 654 632 626 724" fill="none" stroke="${darken(c.body, 0.27)}" stroke-width="46" opacity=".18" filter="url(#${u}-blur)"/>
          <path d="M318 690 Q500 724 682 690" fill="none" stroke="${darken(c.body, 0.13)}" stroke-width="20" opacity=".24"/>
        </g>
        <ellipse cx="500" cy="389" rx="200" ry="51" fill="${lighten(c.body, 0.18)}" stroke="${darken(c.body, 0.17)}" stroke-width="3"/>
        <ellipse cx="500" cy="392" rx="178" ry="42" fill="${darken(c.body, 0.13)}"/>
        <ellipse cx="500" cy="395" rx="170" ry="37" fill="${darken(c.body, 0.27)}"/>
        <ellipse cx="500" cy="398" rx="165" ry="33" fill="${darken(c.body, 0.34)}" opacity=".62"/>
        <path d="M330 414 Q500 452 670 414" fill="none" stroke="${lighten(c.body, 0.35)}" stroke-width="4" opacity=".55"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     03 · INSULATED TUMBLER
     --------------------------------------------------------- */
  function tumblerArt(c) {
    const u = nextUid();
    const body = "M402 300 L598 300 L620 772 Q622 824 500 824 Q378 824 380 772 Z";
    const clip = `<clipPath id="${u}-bottle"><path d="${body}"/></clipPath>
      <linearGradient id="${u}-steel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${darken(c.body, 0.22)}"/>
        <stop offset=".2" stop-color="${lighten(c.body, 0.2)}"/>
        <stop offset=".43" stop-color="${c.body}"/>
        <stop offset=".7" stop-color="${lighten(c.body, 0.06)}"/>
        <stop offset=".88" stop-color="${darken(c.body, 0.12)}"/>
        <stop offset="1" stop-color="${darken(c.body, 0.26)}"/>
      </linearGradient>`;
    return svgWrap(
      u,
      "真空保温杯",
      `${baseDefs(u, c, clip)}
      <ellipse cx="500" cy="842" rx="155" ry="27" fill="#201a12" opacity=".13"/>
      <g filter="url(#${u}-shadow)">
        <path d="${body}" fill="url(#${u}-steel)"/>
        <g clip-path="url(#${u}-bottle)">
          <path d="M414 330 C398 490 402 662 426 800" fill="none" stroke="${lighten(c.body, 0.5)}" stroke-width="24" opacity=".38" filter="url(#${u}-blur)"/>
          <path d="M584 330 C604 500 602 690 580 806" fill="none" stroke="${darken(c.body, 0.32)}" stroke-width="34" opacity=".2" filter="url(#${u}-blur)"/>
          <line x1="404" y1="720" x2="596" y2="720" stroke="${darken(c.body, 0.22)}" stroke-width="2" opacity=".4"/>
          <line x1="404" y1="736" x2="596" y2="736" stroke="${darken(c.body, 0.22)}" stroke-width="2" opacity=".26"/>
        </g>
        <rect x="383" y="250" width="234" height="78" rx="34" fill="${darken(c.body, 0.2)}"/>
        <rect x="396" y="245" width="208" height="70" rx="30" fill="${lighten(darken(c.body, 0.12), 0.08)}"/>
        <ellipse cx="500" cy="253" rx="103" ry="26" fill="${darken(c.body, 0.31)}"/>
        <ellipse cx="500" cy="250" rx="88" ry="19" fill="${darken(c.body, 0.4)}" opacity=".8"/>
        <path d="M410 270 C450 288 552 288 590 270" fill="none" stroke="${lighten(c.body, 0.28)}" stroke-width="3" opacity=".38"/>
        <path d="M602 282 C638 300 640 326 610 340" fill="none" stroke="${darken(c.body, 0.23)}" stroke-width="9" stroke-linecap="round"/>
        <ellipse cx="500" cy="315" rx="99" ry="12" fill="${lighten(c.body, 0.18)}" opacity=".36"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     04 · HEAVYWEIGHT TEE
     --------------------------------------------------------- */
  function teeArt(c) {
    const u = nextUid();
    const body = "M390 228 L300 266 L204 398 L286 472 L340 416 L330 818 Q500 852 670 818 L660 416 L714 472 L796 398 L700 266 L610 228 Q500 292 390 228 Z";
    const clip = `<clipPath id="${u}-tee"><path d="${body}"/></clipPath>`;
    return svgWrap(
      u,
      "重磅纯棉T恤",
      `${baseDefs(u, c, clip)}
      <ellipse cx="500" cy="842" rx="220" ry="26" fill="#201a12" opacity=".07"/>
      <g filter="url(#${u}-shadow)">
        <path d="${body}" fill="url(#${u}-body)"/>
        <g clip-path="url(#${u}-tee)">
          <rect x="180" y="200" width="640" height="660" fill="url(#${u}-weave)" opacity=".2"/>
          <path d="M310 290 L250 390 L300 416 L348 330 Z" fill="${lighten(c.body, 0.28)}" opacity=".32"/>
          <path d="M690 290 L750 390 L704 420 L650 328 Z" fill="${darken(c.body, 0.12)}" opacity=".22"/>
          <path d="M430 500 C470 560 464 700 452 820" fill="none" stroke="${darken(c.body, 0.13)}" stroke-width="5" opacity=".22"/>
          <path d="M575 510 C558 610 566 724 586 820" fill="none" stroke="${lighten(c.body, 0.34)}" stroke-width="8" opacity=".28"/>
          <path d="M500 470 C488 590 494 718 500 836" fill="none" stroke="${darken(c.body, 0.1)}" stroke-width="3" opacity=".13"/>
        </g>
        <path d="M390 228 Q500 292 610 228 Q565 198 500 198 Q435 198 390 228 Z" fill="${darken(c.body, 0.2)}"/>
        <path d="M390 226 Q500 292 610 226" fill="none" stroke="${lighten(c.body, 0.48)}" stroke-width="5" opacity=".58"/>
        <path d="M402 238 Q500 296 598 238" fill="none" stroke="${darken(c.body, 0.16)}" stroke-width="2" opacity=".55"/>
        <path d="M352 274 Q380 348 366 414" fill="none" stroke="${darken(c.body, 0.14)}" stroke-width="3" opacity=".34"/>
        <path d="M648 274 Q620 348 634 414" fill="none" stroke="${darken(c.body, 0.14)}" stroke-width="3" opacity=".34"/>
        <path d="M286 470 L340 416" fill="none" stroke="${darken(c.body, 0.17)}" stroke-width="3" opacity=".35"/>
        <path d="M714 470 L660 416" fill="none" stroke="${darken(c.body, 0.17)}" stroke-width="3" opacity=".35"/>
        <path d="M334 788 Q500 822 666 788" fill="none" stroke="${darken(c.body, 0.17)}" stroke-width="4" opacity=".33"/>
        <path d="M331 800 Q500 836 669 800" fill="none" stroke="${lighten(c.body, 0.38)}" stroke-width="2" opacity=".5"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     05 · WASHED BASEBALL CAP
     --------------------------------------------------------- */
  function capArt(c) {
    const u = nextUid();
    const crown = "M240 504 C240 312 350 254 500 254 C652 254 762 330 760 505 C610 542 390 542 240 504 Z";
    const clip = `<clipPath id="${u}-cap"><path d="${crown}"/></clipPath>`;
    return svgWrap(
      u,
      "水洗棒球帽",
      `${baseDefs(u, c, clip)}
      <ellipse cx="525" cy="655" rx="258" ry="40" fill="#201a12" opacity=".08"/>
      <g filter="url(#${u}-shadow)">
        <path d="${crown}" fill="url(#${u}-body)"/>
        <g clip-path="url(#${u}-cap)">
          <rect x="220" y="230" width="580" height="340" fill="url(#${u}-weave)" opacity=".32"/>
          <path d="M500 262 C430 292 330 382 276 518" fill="none" stroke="${darken(c.body, 0.18)}" stroke-width="4" opacity=".42"/>
          <path d="M500 262 C570 292 670 382 724 518" fill="none" stroke="${darken(c.body, 0.18)}" stroke-width="4" opacity=".42"/>
          <path d="M500 262 L500 534" fill="none" stroke="${darken(c.body, 0.16)}" stroke-width="3" opacity=".32"/>
          <path d="M330 320 C300 370 275 440 268 500" fill="none" stroke="${lighten(c.body, 0.35)}" stroke-width="20" opacity=".2" filter="url(#${u}-blur)"/>
        </g>
        <path d="M600 498 C738 474 898 498 906 558 C914 618 790 644 648 610 C756 602 802 576 766 544 C724 508 664 510 598 524 Z" fill="url(#${u}-side)"/>
        <path d="M600 498 C738 474 898 498 906 558" fill="none" stroke="${lighten(c.body, 0.28)}" stroke-width="5" opacity=".5"/>
        <path d="M650 610 C756 600 802 576 766 544" fill="none" stroke="${darken(c.body, 0.27)}" stroke-width="3" opacity=".5"/>
        <path d="M652 590 C748 594 840 580 884 556" fill="none" stroke="${darken(c.body, 0.2)}" stroke-width="2" stroke-dasharray="6 7" opacity=".55"/>
        <circle cx="500" cy="262" r="17" fill="${darken(c.body, 0.23)}"/>
        <circle cx="500" cy="258" r="11" fill="${lighten(c.body, 0.16)}"/>
        <circle cx="402" cy="328" r="7" fill="${darken(c.body, 0.35)}"/>
        <circle cx="598" cy="328" r="7" fill="${darken(c.body, 0.35)}"/>
        <circle cx="320" cy="430" r="7" fill="${darken(c.body, 0.35)}"/>
        <circle cx="680" cy="430" r="7" fill="${darken(c.body, 0.35)}"/>
        <path d="M278 505 Q500 540 720 505" fill="none" stroke="${darken(c.body, 0.26)}" stroke-width="3" opacity=".38"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     06 · HEAVYWEIGHT HOODIE
     --------------------------------------------------------- */
  function hoodieArt(c) {
    const u = nextUid();
    const body = "M390 233 L300 275 L188 432 L276 508 L334 449 L326 830 Q500 862 674 830 L666 449 L724 508 L812 432 L700 275 L610 233 Q500 300 390 233 Z";
    const clip = `<clipPath id="${u}-hoodie"><path d="${body}"/></clipPath>`;
    return svgWrap(
      u,
      "连帽卫衣",
      `${baseDefs(u, c, clip)}
      <ellipse cx="500" cy="850" rx="236" ry="28" fill="#201a12" opacity=".08"/>
      <g filter="url(#${u}-shadow)">
        <path d="${body}" fill="url(#${u}-body)"/>
        <g clip-path="url(#${u}-hoodie)">
          <rect x="170" y="200" width="660" height="680" fill="url(#${u}-weave)" opacity=".28"/>
          <path d="M436 520 C470 600 464 722 450 842" fill="none" stroke="${darken(c.body, 0.14)}" stroke-width="6" opacity=".22"/>
          <path d="M572 520 C556 622 566 742 590 844" fill="none" stroke="${lighten(c.body, 0.38)}" stroke-width="9" opacity=".3"/>
          <path d="M322 340 L266 430 L310 458 L352 380 Z" fill="${lighten(c.body, 0.3)}" opacity=".28"/>
          <path d="M678 340 L734 430 L690 460 L648 380 Z" fill="${darken(c.body, 0.12)}" opacity=".2"/>
        </g>
        <path d="M388 236 Q388 128 500 116 Q612 128 612 236 Q500 305 388 236 Z" fill="${darken(c.body, 0.1)}"/>
        <path d="M420 231 Q424 164 500 150 Q576 164 580 231 Q500 270 420 231 Z" fill="${darken(c.body, 0.25)}"/>
        <path d="M420 231 Q500 272 580 231" fill="none" stroke="${darken(c.body, 0.24)}" stroke-width="3"/>
        <path d="M390 233 Q500 300 610 233 Q560 202 500 202 Q440 202 390 233 Z" fill="${darken(c.body, 0.16)}" opacity=".7"/>
        <path d="M462 246 C458 336 452 420 444 506" fill="none" stroke="${lighten(c.body, 0.56)}" stroke-width="7" stroke-linecap="round"/>
        <path d="M538 246 C544 330 550 414 558 500" fill="none" stroke="${lighten(c.body, 0.56)}" stroke-width="7" stroke-linecap="round"/>
        <rect x="438" y="500" width="10" height="24" rx="5" fill="${darken(c.body, 0.3)}"/>
        <rect x="554" y="494" width="10" height="24" rx="5" fill="${darken(c.body, 0.3)}"/>
        <path d="M356 658 Q500 682 644 658 L616 806 Q500 826 384 806 Z" fill="${darken(c.body, 0.1)}" opacity=".52"/>
        <path d="M356 658 Q500 682 644 658" fill="none" stroke="${darken(c.body, 0.2)}" stroke-width="3" opacity=".56"/>
        <path d="M330 802 Q500 834 670 802" fill="none" stroke="${darken(c.body, 0.2)}" stroke-width="4" opacity=".4"/>
        <path d="M327 812 Q500 844 673 812" fill="none" stroke="${lighten(c.body, 0.4)}" stroke-width="2" opacity=".52"/>
        <path d="M286 506 L334 450" fill="none" stroke="${darken(c.body, 0.18)}" stroke-width="3" opacity=".4"/>
        <path d="M714 506 L666 450" fill="none" stroke="${darken(c.body, 0.18)}" stroke-width="3" opacity=".4"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     07 · SOFTCOVER NOTEBOOK
     --------------------------------------------------------- */
  function notebookArt(c) {
    const u = nextUid();
    return svgWrap(
      u,
      "软皮笔记本",
      `${baseDefs(u, c)}
      <ellipse cx="515" cy="775" rx="215" ry="30" fill="#201a12" opacity=".1"/>
      <g transform="rotate(-7 500 500)" filter="url(#${u}-shadow)">
        <rect x="330" y="220" width="320" height="548" rx="16" fill="#F1E8D6"/>
        <path d="M640 246 L650 246 L650 748 L640 744 Z" fill="#D6C9B4"/>
        <path d="M646 254 L652 256 L652 740 L646 738 Z" fill="#C3B59E"/>
        <rect x="300" y="208" width="330" height="550" rx="20" fill="url(#${u}-body)"/>
        <rect x="300" y="208" width="46" height="550" rx="20" fill="${darken(c.body, 0.2)}"/>
        <line x1="343" y1="218" x2="343" y2="748" stroke="${darken(c.body, 0.37)}" stroke-width="2" opacity=".5"/>
        <line x1="350" y1="218" x2="350" y2="748" stroke="${lighten(c.body, 0.24)}" stroke-width="1.5" opacity=".35"/>
        <rect x="600" y="208" width="13" height="550" fill="${darken(c.body, 0.25)}" opacity=".7"/>
        <rect x="592" y="208" width="5" height="550" fill="${lighten(c.body, 0.24)}" opacity=".24"/>
        <rect x="368" y="268" width="196" height="426" rx="8" fill="none" stroke="${lighten(c.body, 0.3)}" stroke-width="2" opacity=".22"/>
        <path d="M388 708 L533 708" stroke="${lighten(c.body, 0.28)}" stroke-width="2" opacity=".36"/>
        <text x="388" y="738" font-family="Arial, Helvetica, sans-serif" font-size="14" letter-spacing="3.4" fill="${lighten(c.body, 0.36)}" opacity=".54">A5 / 160 PAGES</text>
        <path d="M318 226 C310 232 306 240 306 252" fill="none" stroke="${lighten(c.body, 0.2)}" stroke-width="2" opacity=".35"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     08 · METAL PEN
     --------------------------------------------------------- */
  function penArt(c) {
    const u = nextUid();
    const metal = `<linearGradient id="${u}-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${darken(c.body, 0.26)}"/>
      <stop offset=".18" stop-color="${lighten(c.body, 0.36)}"/>
      <stop offset=".42" stop-color="${lighten(c.body, 0.08)}"/>
      <stop offset=".62" stop-color="${c.body}"/>
      <stop offset=".82" stop-color="${darken(c.body, 0.18)}"/>
      <stop offset="1" stop-color="${darken(c.body, 0.32)}"/>
    </linearGradient>`;
    return svgWrap(
      u,
      "金属签字笔",
      `${baseDefs(u, c, metal)}
      <g transform="rotate(-31 500 500)" filter="url(#${u}-shadow)">
        <path d="M176 452 L746 452 Q804 452 804 500 Q804 548 746 548 L176 548 L100 500 Z" fill="url(#${u}-metal)"/>
        <path d="M642 452 L752 452 Q808 452 808 500 Q808 548 752 548 L642 548 Z" fill="${darken(c.body, 0.16)}" opacity=".36"/>
        <path d="M142 490 L744 490" stroke="${lighten(c.body, 0.6)}" stroke-width="5" opacity=".4"/>
        <path d="M198 536 L690 536" stroke="${darken(c.body, 0.3)}" stroke-width="2" opacity=".38"/>
        <path d="M352 452 L352 548 M372 452 L372 548 M392 452 L392 548" stroke="${darken(c.body, 0.3)}" stroke-width="4" opacity=".46"/>
        <path d="M672 454 L690 410 Q697 392 716 397 Q731 402 727 422 L716 454 Z" fill="${lighten(c.body, 0.12)}"/>
        <path d="M690 410 L703 408" stroke="${lighten(c.body, 0.48)}" stroke-width="3" opacity=".55"/>
        <path d="M750 452 L750 548" stroke="${darken(c.body, 0.25)}" stroke-width="3" opacity=".38"/>
        <path d="M138 500 L100 500" stroke="${lighten(c.body, 0.45)}" stroke-width="2" opacity=".45"/>
        <ellipse cx="500" cy="470" rx="290" ry="8" fill="${lighten(c.body, 0.6)}" opacity=".14"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     09 · FELT DESK MAT
     --------------------------------------------------------- */
  function deskmatArt(c) {
    const u = nextUid();
    return svgWrap(
      u,
      "桌面毛毡垫",
      `${baseDefs(u, c)}
      <ellipse cx="505" cy="760" rx="410" ry="40" fill="#201a12" opacity=".08"/>
      <g transform="rotate(-3 500 500)" filter="url(#${u}-shadow)">
        <rect x="92" y="255" width="816" height="492" rx="44" fill="url(#${u}-body)"/>
        <g clip-path="url(#${u}-mat)">
          <rect x="92" y="255" width="816" height="492" fill="url(#${u}-weave)" opacity=".34"/>
          <rect x="92" y="255" width="816" height="492" fill="none" stroke="${lighten(c.body, 0.24)}" stroke-width="20" opacity=".16"/>
        </g>
        <rect x="113" y="276" width="774" height="450" rx="32" fill="none" stroke="${darken(c.body, 0.22)}" stroke-width="2" stroke-dasharray="5 8" opacity=".55"/>
        <rect x="92" y="255" width="816" height="492" rx="44" fill="none" stroke="${lighten(c.body, 0.2)}" stroke-width="3" opacity=".36"/>
        <rect x="92" y="255" width="102" height="38" rx="12" fill="${darken(c.body, 0.2)}" opacity=".36"/>
        <text x="118" y="280" font-family="Arial, Helvetica, sans-serif" font-size="13" letter-spacing="3" fill="${lighten(c.body, 0.3)}" opacity=".6">FELT</text>
      </g>
      <defs><clipPath id="${u}-mat"><rect x="92" y="255" width="816" height="492" rx="44"/></clipPath></defs>`
    );
  }

  /* ---------------------------------------------------------
     10 · FOLDING UMBRELLA
     --------------------------------------------------------- */
  function umbrellaArt(c) {
    const u = nextUid();
    const canopy = "M108 470 C158 230 360 148 500 148 C640 148 842 230 892 470 Q836 518 778 468 Q720 524 662 470 Q604 526 546 472 Q488 528 430 472 Q372 526 314 470 Q256 522 198 468 Q152 510 108 470 Z";
    const clip = `<clipPath id="${u}-canopy"><path d="${canopy}"/></clipPath>`;
    return svgWrap(
      u,
      "自动折叠伞",
      `${baseDefs(u, c, clip)}
      <ellipse cx="500" cy="900" rx="130" ry="18" fill="#201a12" opacity=".08"/>
      <g filter="url(#${u}-shadow)">
        <path d="M500 152 L500 804" stroke="${darken(c.body, 0.3)}" stroke-width="9" stroke-linecap="round"/>
        <path d="M500 804 L500 854 Q500 894 456 894 Q420 894 416 862" fill="none" stroke="#895B3E" stroke-width="18" stroke-linecap="round"/>
        <path d="M500 804 L500 854 Q500 886 460 886" fill="none" stroke="#A87654" stroke-width="7" stroke-linecap="round" opacity=".65"/>
        <path d="${canopy}" fill="url(#${u}-body)"/>
        <g clip-path="url(#${u}-canopy)">
          <path d="M500 148 Q430 300 198 468 Q256 522 314 470 Q430 330 500 148 Z" fill="${lighten(c.body, 0.14)}" opacity=".2"/>
          <path d="M500 148 Q565 300 778 468 Q720 524 662 470 Q555 330 500 148 Z" fill="${darken(c.body, 0.18)}" opacity=".16"/>
          <path d="M500 148 Q470 320 314 470 Q372 526 430 472 Q485 330 500 148 Z" fill="${darken(c.body, 0.16)}" opacity=".12"/>
          <path d="M500 148 Q530 320 662 470 Q604 526 546 472 Q510 330 500 148 Z" fill="${lighten(c.body, 0.22)}" opacity=".12"/>
        </g>
        <path d="M500 155 Q450 300 108 470 M500 155 Q460 320 198 468 M500 155 Q470 330 314 470 M500 155 L500 478 M500 155 Q530 330 662 470 M500 155 Q550 320 778 468 M500 155 Q560 310 892 470" fill="none" stroke="${darken(c.body, 0.26)}" stroke-width="3" opacity=".44"/>
        <path d="M108 470 Q152 510 198 468 Q256 522 314 470 Q372 526 430 472 Q488 528 546 472 Q604 526 662 470 Q720 524 778 468 Q836 518 892 470" fill="none" stroke="${lighten(c.body, 0.4)}" stroke-width="3" opacity=".35"/>
        <path d="M500 148 L500 115" stroke="${darken(c.body, 0.3)}" stroke-width="10" stroke-linecap="round"/>
        <circle cx="500" cy="148" r="12" fill="${darken(c.body, 0.3)}"/>
        <path d="M482 286 Q470 410 446 462" fill="none" stroke="${lighten(c.body, 0.45)}" stroke-width="18" opacity=".18" filter="url(#${u}-blur)"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     11 · CITY BACKPACK
     --------------------------------------------------------- */
  function backpackArt(c) {
    const u = nextUid();
    const body = "M316 780 L316 424 Q316 300 500 290 Q684 300 684 424 L684 780 Q684 814 646 814 L354 814 Q316 814 316 780 Z";
    const clip = `<clipPath id="${u}-pack"><path d="${body}"/></clipPath>`;
    return svgWrap(
      u,
      "城市双肩包",
      `${baseDefs(u, c, clip)}
      <ellipse cx="500" cy="836" rx="218" ry="28" fill="#201a12" opacity=".1"/>
      <g filter="url(#${u}-shadow)">
        <path d="M352 414 C296 466 282 650 314 800" fill="none" stroke="${darken(c.body, 0.2)}" stroke-width="46" stroke-linecap="round"/>
        <path d="M648 414 C704 466 718 650 686 800" fill="none" stroke="${darken(c.body, 0.2)}" stroke-width="46" stroke-linecap="round"/>
        <path d="M434 304 C434 232 566 232 566 304" fill="none" stroke="${darken(c.body, 0.28)}" stroke-width="24" stroke-linecap="round"/>
        <path d="M446 294 C446 244 554 244 554 294" fill="none" stroke="${lighten(c.body, 0.24)}" stroke-width="7" stroke-linecap="round" opacity=".34"/>
        <path d="${body}" fill="url(#${u}-body)"/>
        <g clip-path="url(#${u}-pack)">
          <rect x="280" y="270" width="450" height="570" fill="url(#${u}-weave)" opacity=".42"/>
          <path d="M360 320 C330 480 326 660 350 800" fill="none" stroke="${lighten(c.body, 0.38)}" stroke-width="30" opacity=".16" filter="url(#${u}-blur)"/>
          <path d="M642 320 C674 490 670 680 646 802" fill="none" stroke="${darken(c.body, 0.3)}" stroke-width="38" opacity=".16" filter="url(#${u}-blur)"/>
          <path d="M320 520 Q500 546 680 520" fill="none" stroke="${darken(c.body, 0.22)}" stroke-width="3" opacity=".4"/>
          <path d="M320 512 Q500 538 680 512" fill="none" stroke="${lighten(c.body, 0.3)}" stroke-width="2" opacity=".26"/>
        </g>
        <path d="M364 562 L636 562 L636 738 Q636 766 604 766 L396 766 Q364 766 364 738 Z" fill="${darken(c.body, 0.09)}"/>
        <path d="M364 562 L636 562 L636 738 Q636 766 604 766 L396 766 Q364 766 364 738 Z" fill="none" stroke="${darken(c.body, 0.18)}" stroke-width="3" opacity=".55"/>
        <path d="M380 588 Q500 604 620 588" fill="none" stroke="${darken(c.body, 0.3)}" stroke-width="5" opacity=".5"/>
        <path d="M384 598 Q500 614 616 598" fill="none" stroke="${lighten(c.body, 0.35)}" stroke-width="2" opacity=".4"/>
        <rect x="558" y="584" width="12" height="34" rx="6" fill="${darken(c.body, 0.36)}"/>
        <rect x="444" y="716" width="112" height="24" rx="12" fill="${darken(c.body, 0.18)}" opacity=".7"/>
        <path d="M406 338 L406 512" stroke="${darken(c.body, 0.2)}" stroke-width="2" stroke-dasharray="5 7" opacity=".55"/>
        <path d="M594 338 L594 512" stroke="${darken(c.body, 0.2)}" stroke-width="2" stroke-dasharray="5 7" opacity=".55"/>
        <path d="M346 350 Q500 316 654 350" fill="none" stroke="${darken(c.body, 0.18)}" stroke-width="3" opacity=".35"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     12 · MAGNETIC POWER BANK
     --------------------------------------------------------- */
  function powerbankArt(c) {
    const u = nextUid();
    return svgWrap(
      u,
      "磁吸充电宝",
      `${baseDefs(u, c)}
      <ellipse cx="500" cy="792" rx="140" ry="24" fill="#201a12" opacity=".12"/>
      <g filter="url(#${u}-shadow)">
        <rect x="384" y="240" width="232" height="528" rx="48" fill="${darken(c.body, 0.2)}"/>
        <rect x="378" y="234" width="232" height="528" rx="48" fill="url(#${u}-body)"/>
        <rect x="394" y="250" width="200" height="496" rx="38" fill="none" stroke="${lighten(c.body, 0.3)}" stroke-width="2" opacity=".38"/>
        <path d="M414 270 C402 430 404 610 420 746" fill="none" stroke="${lighten(c.body, 0.5)}" stroke-width="18" opacity=".3" filter="url(#${u}-blur)"/>
        <circle cx="560" cy="292" r="5" fill="#D8F180"/>
        <rect x="468" y="742" width="52" height="12" rx="6" fill="${darken(c.body, 0.3)}"/>
        <rect x="478" y="745" width="32" height="6" rx="3" fill="${darken(c.body, 0.46)}"/>
        <text x="500" y="334" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" letter-spacing="3.5" fill="${lighten(c.body, 0.38)}" opacity=".5">10000 mAh</text>
        <path d="M500 700 L500 720" stroke="${lighten(c.body, 0.3)}" stroke-width="2" opacity=".25"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     13 · LEATHER KEYRING
     --------------------------------------------------------- */
  function keyringArt(c) {
    const u = nextUid();
    return svgWrap(
      u,
      "皮质钥匙扣",
      `${baseDefs(u, c)}
      <ellipse cx="500" cy="798" rx="126" ry="20" fill="#201a12" opacity=".1"/>
      <g filter="url(#${u}-shadow)">
        <path d="M432 100 L568 100 L568 214 Q568 258 530 272 L470 272 Q432 258 432 214 Z" fill="url(#${u}-body)"/>
        <rect x="444" y="100" width="112" height="34" rx="17" fill="${darken(c.body, 0.22)}"/>
        <rect x="452" y="107" width="96" height="20" rx="10" fill="${darken(c.body, 0.3)}" opacity=".64"/>
        <circle cx="500" cy="247" r="7" fill="${darken(c.body, 0.42)}"/>
        <circle cx="500" cy="348" r="73" fill="none" stroke="#B6B7AF" stroke-width="18"/>
        <circle cx="500" cy="348" r="73" fill="none" stroke="#E9E6DC" stroke-width="6"/>
        <path d="M500 272 L500 292" stroke="#B6B7AF" stroke-width="14"/>
        <path d="M456 405 Q500 382 544 405" fill="none" stroke="#B6B7AF" stroke-width="14"/>
        <rect x="374" y="404" width="252" height="334" rx="38" fill="url(#${u}-body)"/>
        <rect x="392" y="422" width="216" height="298" rx="27" fill="none" stroke="${lighten(c.body, 0.24)}" stroke-width="2" stroke-dasharray="4 6" opacity=".55"/>
        <circle cx="500" cy="444" r="10" fill="${darken(c.body, 0.45)}"/>
        <circle cx="500" cy="444" r="5" fill="${lighten(c.body, 0.1)}" opacity=".4"/>
        <path d="M374 620 Q500 638 626 620" fill="none" stroke="${darken(c.body, 0.18)}" stroke-width="2" opacity=".3"/>
      </g>`
    );
  }

  /* ---------------------------------------------------------
     PRODUCT DATA
     --------------------------------------------------------- */
  const PRODUCTS = [
    {
      id: "tote",
      name: "原色帆布袋",
      en: "CANVAS TOTE",
      category: "穿戴",
      price: 38,
      moq: 50,
      size: "38 × 42 cm",
      craft: "12oz 加厚帆布 · 单面丝印",
      desc: "最不容易出错的品牌载体。通勤、买菜、装电脑，每一次使用都是一次曝光。",
      tag: "热选",
      scene: "#DCE4B9",
      print: { x: 500, y: 602, w: 318, h: 248 },
      baseRotation: 0,
      colors: [
        { name: "本白", body: "#E7D8BD", dark: "#D0BD99", light: "#F5EAD5", detail: "#9A8462" },
        { name: "橄榄", body: "#858F6C", dark: "#6D7657", light: "#AAB295", detail: "#586046" },
        { name: "炭黑", body: "#3A3C38", dark: "#2A2C29", light: "#5B5E57", detail: "#1B1D1A" },
        { name: "陶土", body: "#B96D4F", dark: "#9D563A", light: "#D18C70", detail: "#793E28" },
      ],
      art: toteArt,
    },
    {
      id: "mug",
      name: "陶瓷马克杯",
      en: "CERAMIC MUG",
      category: "办公",
      price: 28,
      moq: 50,
      size: "350 ml",
      craft: "高温釉下彩 · 全彩转印",
      desc: "放在工位上的品牌广告。每天至少被看见三次，比任何开屏都持久。",
      tag: "经典",
      scene: "#E9DDC8",
      print: { x: 497, y: 568, w: 248, h: 190 },
      baseRotation: 0,
      colors: [
        { name: "奶白", body: "#F1EADD", dark: "#D8CEBE", light: "#FFFDF8", detail: "#A89A85" },
        { name: "森林绿", body: "#2E5B4B", dark: "#21463A", light: "#477866", detail: "#163329" },
        { name: "陶土", body: "#B96648", dark: "#9B4E33", light: "#D08465", detail: "#743923" },
        { name: "曜石黑", body: "#2A2C29", dark: "#1E201D", light: "#484B46", detail: "#121411" },
      ],
      art: mugArt,
    },
    {
      id: "notebook",
      name: "软皮笔记本",
      en: "SOFTCOVER NOTEBOOK",
      category: "办公",
      price: 32,
      moq: 100,
      size: "A5 · 160 页",
      craft: "烫金 / 压印 / 丝印",
      desc: "会议桌上最体面的小物。可以烫金、压印，也可以只留一个安静的压纹 Logo。",
      tag: "可烫金",
      scene: "#D8DDC4",
      print: { x: 516, y: 482, w: 228, h: 178 },
      baseRotation: -7,
      colors: [
        { name: "焦糖", body: "#A9663F", dark: "#8A4E2D", light: "#C1845E", detail: "#5E3420" },
        { name: "墨黑", body: "#30322F", dark: "#222421", light: "#4F534C", detail: "#171916" },
        { name: "苔绿", body: "#5D6A4E", dark: "#48543C", light: "#7C8969", detail: "#333D29" },
        { name: "砂岩", body: "#B9A587", dark: "#9E8B6D", light: "#D1BFA2", detail: "#75634A" },
      ],
      art: notebookArt,
    },
    {
      id: "pen",
      name: "金属签字笔",
      en: "METAL PEN",
      category: "办公",
      price: 18,
      moq: 100,
      size: "14 cm · 0.5 mm",
      craft: "激光雕刻 · 单色",
      desc: "预算友好，但握手的分量不廉价。适合展会、培训、会议伴手礼。",
      tag: "低预算",
      scene: "#E5E0D4",
      print: { x: 462, y: 500, w: 242, h: 50 },
      baseRotation: -31,
      colors: [
        { name: "银灰", body: "#BFC1BC", dark: "#9EA19C", light: "#E8E9E5", detail: "#777A75" },
        { name: "曜石黑", body: "#343632", dark: "#252723", light: "#585B54", detail: "#181A17" },
        { name: "香槟", body: "#C4AD83", dark: "#A58E65", light: "#E1CFAC", detail: "#7C6745" },
      ],
      art: penArt,
    },
    {
      id: "deskmat",
      name: "桌面毛毡垫",
      en: "FELT DESK MAT",
      category: "办公",
      price: 45,
      moq: 50,
      size: "80 × 40 cm",
      craft: "丝印 / 刺绣",
      desc: "一铺上桌，整个工位都成了品牌的主场。适合互联网、设计与创意团队。",
      tag: "办公场景",
      scene: "#E4D7C4",
      print: { x: 500, y: 490, w: 320, h: 190 },
      baseRotation: -3,
      colors: [
        { name: "燕麦", body: "#C9B99D", dark: "#AF9F83", light: "#E2D3B8", detail: "#8A7A5F" },
        { name: "石墨", body: "#4A4D48", dark: "#383B37", light: "#696D65", detail: "#282A27" },
        { name: "鼠尾草", body: "#93A08B", dark: "#7B8874", light: "#ADB8A4", detail: "#606C58" },
      ],
      art: deskmatArt,
    },
    {
      id: "tee",
      name: "重磅纯棉 T 恤",
      en: "HEAVYWEIGHT TEE",
      category: "穿戴",
      price: 58,
      moq: 50,
      size: "S–3XL",
      craft: "胸前丝印 / 刺绣",
      desc: "团队活动、发布会、志愿者服装。选对版型和克重，员工是真的会穿出门。",
      tag: "高感知",
      scene: "#D9E0D8",
      print: { x: 500, y: 542, w: 292, h: 238 },
      baseRotation: 0,
      colors: [
        { name: "米白", body: "#E5DDCE", dark: "#CEC5B4", light: "#F7F0E3", detail: "#9E9280" },
        { name: "雾灰", body: "#9EA09A", dark: "#83857F", light: "#BABCB5", detail: "#656862" },
        { name: "墨绿", body: "#314A3E", dark: "#24382E", light: "#4A6859", detail: "#18281F" },
        { name: "炭黑", body: "#393B37", dark: "#292B28", light: "#595C55", detail: "#1A1C19" },
      ],
      art: teeArt,
    },
    {
      id: "cap",
      name: "水洗棒球帽",
      en: "WASHED CAP",
      category: "穿戴",
      price: 42,
      moq: 50,
      size: "可调节 · 均码",
      craft: "前片刺绣",
      desc: "年轻团队最爱的单品。刺绣比印花更有质感，也适合做活动限定款。",
      tag: "年轻团队",
      scene: "#DFD5BC",
      print: { x: 474, y: 432, w: 218, h: 104 },
      baseRotation: 0,
      colors: [
        { name: "沙色", body: "#C6AE86", dark: "#A9916B", light: "#DDC8A2", detail: "#7D6848" },
        { name: "藏青", body: "#2C3D4B", dark: "#1F2D39", light: "#455A69", detail: "#16222B" },
        { name: "炭黑", body: "#343632", dark: "#252723", light: "#545751", detail: "#181A17" },
      ],
      art: capArt,
    },
    {
      id: "hoodie",
      name: "连帽卫衣",
      en: "HEAVY HOODIE",
      category: "穿戴",
      price: 98,
      moq: 50,
      size: "S–3XL",
      craft: "胸前刺绣 / 厚板印花",
      desc: "秋冬入职礼的正确答案。厚实、好穿、不会被塞进衣柜最底层。",
      tag: "秋冬",
      scene: "#D8D4C2",
      print: { x: 500, y: 540, w: 278, h: 212 },
      baseRotation: 0,
      colors: [
        { name: "燕麦", body: "#CFC2A9", dark: "#B6A88E", light: "#E4D8C1", detail: "#8B7C62" },
        { name: "炭灰", body: "#5A5B55", dark: "#454641", light: "#777972", detail: "#31322E" },
        { name: "森林", body: "#2C4E40", dark: "#203C31", light: "#446A59", detail: "#152B22" },
      ],
      art: hoodieArt,
    },
    {
      id: "umbrella",
      name: "自动折叠伞",
      en: "FOLDING UMBRELLA",
      category: "出行",
      price: 68,
      moq: 50,
      size: "八骨 · 晴雨两用",
      craft: "单面丝印",
      desc: "下雨天被撑开的品牌。比传单更体面，也比广告更被需要。",
      tag: "雨季",
      scene: "#CBD9CD",
      print: { x: 373, y: 350, w: 178, h: 112 },
      baseRotation: 0,
      colors: [
        { name: "墨绿", body: "#315344", dark: "#233F33", light: "#4A705E", detail: "#182D24" },
        { name: "酒红", body: "#6D3438", dark: "#542629", light: "#8B4C50", detail: "#3D191B" },
        { name: "曜石黑", body: "#30322F", dark: "#222421", light: "#4F534C", detail: "#171916" },
      ],
      art: umbrellaArt,
    },
    {
      id: "backpack",
      name: "城市双肩包",
      en: "CITY BACKPACK",
      category: "出行",
      price: 128,
      moq: 30,
      size: "20 L · 可放 15 寸电脑",
      craft: "前袋刺绣 / 胶章",
      desc: "预算高一点，但使用频率也高。适合客户答谢、校招、长期项目纪念。",
      tag: "客户礼",
      scene: "#D6CDB9",
      print: { x: 500, y: 472, w: 240, h: 146 },
      baseRotation: 0,
      colors: [
        { name: "沙色", body: "#B8A17E", dark: "#9D8765", light: "#D0BC9C", detail: "#786447" },
        { name: "炭黑", body: "#3D403C", dark: "#2C2F2B", light: "#5C6059", detail: "#1D1F1C" },
        { name: "森林", body: "#2C4B3F", dark: "#203A30", light: "#436657", detail: "#15291F" },
      ],
      art: backpackArt,
    },
    {
      id: "tumbler",
      name: "真空保温杯",
      en: "INSULATED TUMBLER",
      category: "出行",
      price: 88,
      moq: 50,
      size: "500 ml · 316 内胆",
      craft: "激光雕刻 / 丝印",
      desc: "最稳的商务伴手礼。每天喝水都会看到，而且很难被转手。",
      tag: "实用",
      scene: "#D9DEC9",
      print: { x: 500, y: 590, w: 146, h: 156 },
      baseRotation: 0,
      colors: [
        { name: "奶白", body: "#E7E1D4", dark: "#CEC6B7", light: "#FAF6EC", detail: "#9C917F" },
        { name: "森林", body: "#2C4E40", dark: "#203C31", light: "#446A59", detail: "#152B22" },
        { name: "银灰", body: "#B9BBB6", dark: "#9A9D97", light: "#E2E4DF", detail: "#72756F" },
      ],
      art: tumblerArt,
    },
    {
      id: "powerbank",
      name: "磁吸充电宝",
      en: "MAGNETIC POWER BANK",
      category: "数码",
      price: 108,
      moq: 30,
      size: "10000 mAh · 15W",
      craft: "UV 彩印 / 激光雕刻",
      desc: "手机没电的时候，没有人会拒绝你的品牌。科技团队和发布会的好选择。",
      tag: "科技感",
      scene: "#D7DDD7",
      print: { x: 500, y: 486, w: 148, h: 172 },
      baseRotation: 0,
      colors: [
        { name: "奶白", body: "#E6E0D4", dark: "#CCC5B7", light: "#FAF6ED", detail: "#978C7C" },
        { name: "石墨", body: "#444742", dark: "#323530", light: "#63675F", detail: "#232522" },
        { name: "雾蓝", body: "#8CA3AF", dark: "#748B97", light: "#A8BBC5", detail: "#536A75" },
      ],
      art: powerbankArt,
    },
    {
      id: "keyring",
      name: "皮质钥匙扣",
      en: "LEATHER KEYRING",
      category: "生活",
      price: 22,
      moq: 100,
      size: "8 × 4 cm",
      craft: "压印 / 金属牌",
      desc: "轻量、低成本，但每天出门都会摸到。适合作为礼盒里的点睛小件。",
      tag: "轻量",
      scene: "#E2D5BF",
      print: { x: 500, y: 572, w: 158, h: 126 },
      baseRotation: 0,
      colors: [
        { name: "焦糖", body: "#A9663F", dark: "#8A4E2D", light: "#C1845E", detail: "#5E3420" },
        { name: "墨黑", body: "#30322F", dark: "#222421", light: "#4F534C", detail: "#171916" },
        { name: "橄榄", body: "#737B5D", dark: "#5D644A", light: "#8E9678", detail: "#454B37" },
      ],
      art: keyringArt,
    },
  ];

  /* ---------------------------------------------------------
     DEMO LOGO
     --------------------------------------------------------- */
  const SAMPLE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 160">
    <circle cx="82" cy="80" r="66" fill="#193B32"/>
    <path d="M53 108 V54 h16 l18 30 18-30h16v54H104V79l-14 25H75L60 79v29z" fill="#F4EFE4"/>
    <text x="174" y="78" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" fill="#193B32" letter-spacing="1">MONO</text>
    <text x="176" y="114" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="500" fill="#6E7A72" letter-spacing="7">GIFTING CO.</text>
  </svg>`;
  const SAMPLE_LOGO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SAMPLE_LOGO_SVG)}`;

  window.LIXU = {
    PRODUCTS,
    SAMPLE_LOGO,
    renderProductSVG(product, colorway) {
      return product.art(colorway);
    },
    utils: { lighten, darken, mix, toRgb },
  };
})();
