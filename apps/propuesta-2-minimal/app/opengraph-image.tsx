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
          background: '#ffffff',
          color: '#0a0a0a',
          padding: '80px',
          fontFamily: 'Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 4, color: '#1d4ed8' }}>
          DIRECTOR DE MEDIOS · ABOGADO · PERIODISTA
        </div>
        <div style={{ fontSize: 150, fontWeight: 600, letterSpacing: -4, lineHeight: 1 }}>
          Mario Cepeda
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#71717a' }}>
          <span>Nariño · Colombia</span>
          <span style={{ color: '#1d4ed8' }}>—</span>
        </div>
      </div>
    ),
    size,
  );
}
