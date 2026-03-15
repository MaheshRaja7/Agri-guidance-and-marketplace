"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const backgroundMap: Record<string, string> = {
  "/": "/background-images/homepage.jpg",
  "/login": "/background-images/login-page.jpg",
  "/register": "/background-images/register-page.jpg",
  "/marketplace": "/background-images/marketplace-page.jpg",
  "/weather": "/background-images/weather-page.jpg",
  "/disease-detection": "/background-images/disease-detection-page.jpg",
  "/chat": "/background-images/ai-chat-page.jpg",
  "/farmer/dashboard": "/background-images/homepage.jpg",
  "/customer/orders": "/background-images/myorderspage.jpg",
};

export default function Background() {
  const pathname = usePathname();

  useEffect(() => {
    // Darker overlay for better text contrast (similar to the example image)
    const overlay = "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.15))";
    const defaultBg = `${overlay}, url('/background-images/homepage.jpg')`;

    const matchKey = Object.keys(backgroundMap).find(
      (key) => key !== "/" && pathname?.startsWith(key)
    );
    const bgPath = backgroundMap[pathname] || backgroundMap[matchKey || "/"] || "/background-images/homepage.jpg";

    const backgroundImage = `${overlay}, url('${encodeURI(bgPath)}')`;

    document.body.style.backgroundImage = backgroundImage;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";

    return () => {
      document.body.style.backgroundImage = defaultBg;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
    };
  }, [pathname]);

  return null;
}
