'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="panel"><div className="empty"><h1>This view could not be loaded</h1><p>The application encountered an unexpected error. No substitute statistics have been generated.</p><button className="button primary" onClick={reset}>Try this view again</button></div></section>;}
