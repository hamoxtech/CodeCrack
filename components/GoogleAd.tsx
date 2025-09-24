import React, { useEffect } from "react";

const GoogleAd: React.FC = () => {
  useEffect(() => {
    try {
      // Tell AdSense to load this <ins> as an ad
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error", err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6419622111974542"
      data-ad-slot="7383588698"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default GoogleAd;
