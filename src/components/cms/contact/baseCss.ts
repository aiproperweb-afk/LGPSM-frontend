// Default appearance of the builder's components. Every selector starts with .cb-root, so nothing here can reach the
// navbar, the footer or any other page. It is placed before the page's own rules, which therefore override it.
export const BASE_CSS = `
.cb-root{overflow-x:clip;display:flex;flex-direction:column;width:100%}
.cb-root [data-cb]{box-sizing:border-box;min-width:0;max-width:100%}
.cb-root [data-cb-slot]{display:flex;flex-direction:column;min-width:0;position:relative}
.cb-root .cb-container{display:flex;flex-direction:column}
.cb-root .cb-container>[data-cb-slot]{flex:1 1 auto}
.cb-root .cb-sunburst{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.cb-root .cb-row>[data-cb-slot]{flex-direction:row}
.cb-root a.cb-link,.cb-root .cb-list a,.cb-root .cb-text a{color:inherit}
.cb-root a.cb-link{transition:color .15s ease}
.cb-root .cb-text-background{-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 .15em}
.cb-root .cb-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.cb-root .cb-sr-editor{font-size:12px;color:#64748b;border:1px dashed #94a3b8;padding:4px 8px;margin:0 16px 8px;border-radius:6px}
.cb-root .cb-richtext p+p{margin-top:.75em}
.cb-root .cb-richtext ul{list-style:disc;padding-left:1.5em}
.cb-root .cb-richtext ol{list-style:decimal;padding-left:1.5em}
.cb-root .cb-richtext a{color:#1F65FF;text-decoration:underline}
.cb-root .cb-richtext blockquote{border-left:3px solid #CBD5E1;padding-left:1em}
.cb-root .cb-richtext h1{font-size:2em}.cb-root .cb-richtext h2{font-size:1.5em}.cb-root .cb-richtext h3{font-size:1.25em}
.cb-root .cb-list{padding-left:1.5em;display:flex;flex-direction:column;gap:6px}
.cb-root ul.cb-list{list-style:disc}.cb-root ol.cb-list{list-style:decimal}
.cb-root .cb-list li{display:list-item}
.cb-root .cb-quote cite{display:block;margin-top:8px;font-size:.875em;font-style:normal;opacity:.8}
.cb-root .cb-divider{border-width:1px 0 0;border-color:#E1EAF8;width:100%}
.cb-root .cb-image{display:flex;flex-direction:column;margin:0}
.cb-root .cb-image img{display:block;width:100%;height:100%;min-height:0;object-fit:cover}
.cb-root .cb-image>a{display:block;flex:1 1 auto;min-height:0}
.cb-root .cb-image>img{flex:1 1 auto}
.cb-root .cb-image figcaption{margin-top:6px;font-size:13px;color:#6B7391}
.cb-root .cb-placeholder{display:flex;align-items:center;justify-content:center;min-height:120px;height:100%;width:100%;background:#F1F5F9;border:1px dashed #94A3B8;border-radius:12px;color:#64748B;font-size:13px;text-align:center;padding:12px}
.cb-root .cb-gallery{display:grid;grid-template-columns:repeat(var(--cb-columns,3),minmax(0,1fr));gap:12px}
.cb-root .cb-gallery figure{margin:0}
.cb-root .cb-gallery img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.cb-root .cb-gallery figcaption{margin-top:6px;font-size:13px;color:#6B7391}
@media (max-width:639.98px){.cb-root .cb-gallery{grid-template-columns:repeat(min(var(--cb-columns,3),2),minmax(0,1fr))}}
.cb-root .cb-embed{position:relative;overflow:hidden;min-height:80px}
.cb-root .cb-embed iframe,.cb-root .cb-embed video{position:absolute;inset:0;width:100%;height:100%;border:0}
.cb-root .cb-video{aspect-ratio:16/9}
.cb-root .cb-icon{display:inline-flex;align-self:flex-start;line-height:0;flex-shrink:0}
.cb-root .cb-button{display:inline-flex;align-self:flex-start;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 24px;border-radius:12px;font-size:16px;font-weight:600;line-height:1.25;border:1px solid transparent;cursor:pointer;transition:filter .15s ease,transform .1s ease}
.cb-root .cb-button:hover{filter:brightness(.95)}
.cb-root .cb-button--primary{color:#fff;background-image:linear-gradient(180deg,#1F65FF 0%,#2071FF 33%,#2181FF 69%,#1F65FF 100%)}
.cb-root .cb-button--secondary{color:#000B2C;background-color:#EEF3FF}
.cb-root .cb-button--outline{color:#1F65FF;border-color:#1F65FF;background:transparent}
.cb-root .cb-button--ghost{color:#1F65FF;background:transparent}
.cb-root .cb-icon-button{display:inline-flex;align-self:flex-start;align-items:center;justify-content:center;width:48px;height:48px;border-radius:999px;font-size:22px;background:#EEF3FF;color:#1F65FF}
.cb-root .cb-link-button{display:inline-flex;align-self:flex-start;align-items:center;gap:6px;color:#1F65FF;font-weight:600;font-size:15px}
.cb-root .cb-link-button:hover{text-decoration:underline}
.cb-root .cb-accordion>[data-cb-slot]{gap:inherit}
.cb-root .cb-faq summary{cursor:pointer;list-style-position:inside}
.cb-root .cb-faq>[data-cb-slot]{margin-top:8px}
.cb-root .cb-tabs [role=tablist]{display:flex;flex-wrap:wrap;gap:4px;border-bottom:1px solid #E1EAF8;margin-bottom:16px}
.cb-root .cb-tab{padding:10px 16px;font-size:15px;font-weight:600;color:#4A5470;border-bottom:2px solid transparent;cursor:pointer}
.cb-root .cb-tab[aria-selected=true]{color:#1F65FF;border-bottom-color:#1F65FF}
.cb-root .cb-social ul{display:flex;flex-wrap:wrap;gap:inherit}
.cb-root .cb-social{gap:12px}
.cb-root .cb-social a{display:flex;align-items:center;justify-content:center;border-radius:999px;background:#EEF3FF;color:#1F65FF;transition:background-color .15s ease,color .15s ease}
.cb-root .cb-social a:hover{background:#1F65FF;color:#fff}
.cb-root .cb-hours{display:flex;flex-direction:column;gap:8px}
.cb-root .cb-hours div{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.cb-root .cb-hours dd{font-weight:600;color:#000B2C}
.cb-root .cb-form{position:relative}
.cb-root .cb-label{display:block;margin-bottom:6px;font-size:15px;font-weight:500;color:#000B2C}
.cb-root .cb-required{color:#fb2c36}
.cb-root .cb-optional{font-weight:400;color:#6B7391}
.cb-root .cb-input{width:100%;height:48px;padding:0 16px;border-radius:12px;border:1px solid #E1EAF8;background-color:#F6F8FF;font-size:15px;color:#000B2C;transition:color .15s ease,background-color .15s ease,border-color .15s ease}
.cb-root .cb-input::placeholder{color:#8A94AD}
.cb-root .cb-input:focus{outline:none;border-color:#1F65FF;background-color:#fff}
.cb-root .cb-input:disabled{opacity:.6}
.cb-root textarea.cb-input{display:block;height:auto;padding-top:12px;padding-bottom:12px;resize:none}
.cb-root .cb-choices{display:flex;flex-direction:column;gap:8px;border:0;padding:0;margin:0}
.cb-root .cb-choice{display:flex;align-items:center;gap:10px;font-size:15px;color:#000B2C}
.cb-root .cb-choice input{width:18px;height:18px;accent-color:#1F65FF;flex-shrink:0}
.cb-root .cb-help{margin-top:6px;font-size:13px;color:#6B7391}
.cb-root .cb-error{margin-top:6px;font-size:12px;color:#B3261E}
.cb-root .cb-submit-wrap{display:flex;flex-direction:column}
.cb-root .cb-submit{height:48px;width:100%;border-radius:12px;font-size:16px;font-weight:600;color:#fff;cursor:pointer;background-image:linear-gradient(180deg,#1F65FF 0%,#2071FF 33%,#2181FF 69%,#1F65FF 100%);transition:filter .15s ease,transform .1s ease}
.cb-root .cb-submit:hover{filter:brightness(.95)}
.cb-root .cb-submit:active{transform:scale(.99)}
.cb-root .cb-submit:disabled{cursor:not-allowed;opacity:.7}
.cb-root .cb-honeypot{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden}
`;
