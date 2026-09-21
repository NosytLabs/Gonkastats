import Link from 'next/link';
export default function NotFound(){return <div className="empty"><div className="eyebrow">404 / NOT FOUND</div><h1>No observation at this address</h1><p>Check the page URL, model identifier, block height, or Gonka address checksum.</p><Link className="button primary" href="/">Back to the observatory</Link></div>;}
