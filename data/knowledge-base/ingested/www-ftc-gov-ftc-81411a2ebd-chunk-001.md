---
source_url: https://www.ftc.gov/modules/contrib/extlink/css/extlink.css?t9uj6c
authority_level: primary
jurisdiction: US
retrieved_at: 2026-02-09T07:56:06.537592+00:00
last_updated: Tue, 27 Jan 2026 23:18:05 GMT
---
/** * @file * External links css file. */ span.ext { width: 10px; height: 10px; padding-right: 12px; text-decoration: none; background: url('../images/extlink_s.png') 2px center no-repeat; } span.mailto { width: 10px; height: 10px; padding-right: 12px; text-decoration: none; background: url('../images/extlink_s.png') -20px center no-repeat; } span.tel { width: 10px; height: 10px; padding-right: 12px; text-decoration: none; background: url('../images/extlink_s.png') -42px center no-repeat; } svg.ext { width: 14px; height: 14px; fill: #727272; font-weight: 900; } svg.mailto, svg.tel { width: 14px; height: 14px; fill: #727272; } [data-extlink-placement='prepend'], [data-extlink-placement='before'] { padding-right: 0.2rem; } [data-extlink-placement='append'], [data-extlink-placement='after'] { padding-left: 0.2rem; } svg.ext path, svg.mailto path, svg.tel path { stroke: #727272; stroke-width: 3; } /* Hide the extra icons when printing. */ @media print { svg.ext, svg.mailto, svg.tel, span.ext, span.mailto, span.tel { display: none; padding: 0; } } /* Put some whitespace between the link and its Font Awesome suffix. */ .extlink i { padding-left: 0.2em; } .extlink-nobreak { white-space: nowrap; }
