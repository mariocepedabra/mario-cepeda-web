import { ImageResponse } from 'next/og';

import { SITE_DEFAULTS } from '@mario/core/lib';

export const alt = SITE_DEFAULTS.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f6f1e7',
          color: '#1b1714',
          padding: '70px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 24,
            textTransform: 'uppercase',
            letterSpacing: 6,
            color: '#9a2c1e',
          }}
        >
          <span>Periodismo · Derecho · Opinión</span>
          <span>Nariño · Colombia</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 130, fontWeight: 700, lineHeight: 1 }}>Mario Cepeda</div>
          <div style={{ marginTop: 20, fontSize: 40, fontStyle: 'italic', color: '#4b443c' }}>
            Director de medios · Abogado · Periodista
          </div>
        </div>
        <div style={{ height: 8, width: 220, background: '#9a2c1e' }} />
      </div>
    ),
    size,
  );
}
