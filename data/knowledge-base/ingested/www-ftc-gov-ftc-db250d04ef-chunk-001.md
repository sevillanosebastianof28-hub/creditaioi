---
source_url: https://www.ftc.gov/core/modules/layout_builder/layouts/threecol_section/threecol_section.css?t9uj6c
authority_level: primary
jurisdiction: US
retrieved_at: 2026-02-09T07:56:57.163769+00:00
last_updated: Tue, 27 Jan 2026 23:17:43 GMT
---
/* * @file * Provides the layout styles for three-column layout section. */ .layout--threecol-section { display: flex; flex-wrap: wrap; } .layout--threecol-section > .layout__region { flex: 0 1 100%; } @media screen and (min-width: 40em) { .layout--threecol-section--25-50-25 > .layout__region--first, .layout--threecol-section--25-50-25 > .layout__region--third, .layout--threecol-section--25-25-50 > .layout__region--first, .layout--threecol-section--25-25-50 > .layout__region--second, .layout--threecol-section--50-25-25 > .layout__region--second, .layout--threecol-section--50-25-25 > .layout__region--third { flex: 0 1 25%; } .layout--threecol-section--25-50-25 > .layout__region--second, .layout--threecol-section--25-25-50 > .layout__region--third, .layout--threecol-section--50-25-25 > .layout__region--first { flex: 0 1 50%; } .layout--threecol-section--33-34-33 > .layout__region--first, .layout--threecol-section--33-34-33 > .layout__region--third { flex: 0 1 33%; } .layout--threecol-section--33-34-33 > .layout__region--second { flex: 0 1 34%; } }
