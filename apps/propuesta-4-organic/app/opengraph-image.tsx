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
          background: '#fdf6ec',
          color: '#3b2f27',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: '#ffffff',
            color: '#c75e3a',
            fontSize: 26,
            fontWeight: 700,
            padding: '10px 24px',
            borderRadius: 999,
          }}
        >
          Director de medios · Abogado · Periodista
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 70, color: '#6b5a4c' }}>Hola, soy</div>
          <div style={{ fontSize: 140, fontWeight: 800, color: '#c75e3a', lineHeight: 1 }}>
            Mario Cepeda
          </div>
        </div>
        <div style={{ fontSize: 24, color: '#6b5a4c' }}>Nariño · Colombia</div>
      </div>
    ),
    size,
  );
}
