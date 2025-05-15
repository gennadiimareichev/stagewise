'use client';
import dynamic from 'next/dynamic';

const DynamicToolbar = dynamic(
  () => import('@stagewise/toolbar-next').then((mod) => mod.StagewiseToolbar),
  { ssr: false }
);

export default function Temp() {
  return (
    <DynamicToolbar
      config={{
        plugins: [
          // Load A11yPlugin only on client side
          typeof window !== 'undefined'
            ? require('@stagewise/plugin-a11y').A11yPlugin
            : null,
        ].filter(Boolean),
      }}
    />
  );
}
