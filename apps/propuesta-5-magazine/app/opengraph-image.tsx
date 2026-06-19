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
          color: '#16181d',
          padding: '72px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 26,
            fontWeight: 700,
            color: '#0a73e6',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#0a73e6',
              color: '#ffffff',
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            MC
          </div>
          <span>El blog de Mario Cepeda</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 116, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>
            Mario Cepeda
          </div>
          <div style={{ marginTop: 24, fontSize: 38, color: '#5a6068' }}>
            Director de medios · Abogado · Periodista
          </div>
        </div>
        <div style={{ display: 'flex', height: 10, width: 240, background: '#0a73e6', borderRadius: 6 }} />
      </div>
    ),
    size,
  );
}
