'use client';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRef, useCallback } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001';

interface CaptchaWidgetProps {
  readonly onVerify: (token: string) => void;
  readonly onExpire?: () => void;
}

export default function CaptchaWidget({ onVerify, onExpire }: CaptchaWidgetProps) {
  const captchaRef = useRef<HCaptcha>(null);

  const handleVerify = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  return (
    <div className="flex justify-center my-3">
      <HCaptcha
        ref={captchaRef}
        sitekey={SITE_KEY}
        onVerify={handleVerify}
        onExpire={handleExpire}
        size="normal"
      />
    </div>
  );
}
