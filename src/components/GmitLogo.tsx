import React, { useState } from 'react';
import logoGmitOfficial from '../assets/logo_gmit_official.png';
import { LOGO_BASE64 } from '../assets/logo_base64';

interface GmitLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function GmitLogo({ className = "h-8 w-8", style }: GmitLogoProps) {
  const [imgSrc, setImgSrc] = useState<string>(logoGmitOfficial);

  const handleError = () => {
    if (imgSrc === logoGmitOfficial) {
      // Try root-relative public folder path next
      setImgSrc("/logo_gmit_official.png");
    } else if (imgSrc === "/logo_gmit_official.png") {
      // Both failed, fallback to the embedded Base64 string of the official logo
      setImgSrc(`data:image/png;base64,${LOGO_BASE64}`);
    }
  };

  return (
    <img 
      src={imgSrc} 
      onError={handleError}
      alt="Logo Sinode GMIT (Gereja Masehi Injili di Timor)" 
      className={`${className} object-contain shrink-0`} 
      style={style}
      referrerPolicy="no-referrer"
      id="gmit-official-logo-img"
    />
  );
}



