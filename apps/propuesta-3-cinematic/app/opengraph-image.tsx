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
          background: 'linear-gradient(135deg, #07070f 0%, #14122b 60%, #0a1a26 100%)',
          color: '#ecedf6',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 8, color: '#22d3ee', textTransform: 'uppercase' }}>
          Director de medios · Abogado · Periodista
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 150,
            fontWeight: 700,
            lineHeight: 1,
            backgroundImage: 'linear-gradient(120deg, #a78bfa, #22d3ee)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Mario Cepeda
        </div>
        <div style={{ fontSize: 24, color: '#a2a6c0' }}>Nariño · Colombia</div>
      </div>
    ),
    size,
  );
}
