import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import AnnouncementBar from "@/components/AnnouncementBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sn Shop16 - متجر ملابس نسائية",
  description: "متجر ملابس نسائية أنيق في الجزائر - فساتين، عبايات، ملابس كاجوال، إكسسوارات",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
  const metaPixelId = settings?.metaPixelId || "";
  const tiktokPixelId = settings?.tiktokPixelId || "";

  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {metaPixelId && (
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        {tiktokPixelId && (
          <Script
            id="tt-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function (w, d, t) {
                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
                  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                  ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
                  ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._r=r,ttq._t=ttq._t||{},ttq._t[e+""]=+new Date,ttq._o=ttq._o||{},ttq._o[e+""]=n||{};
                  var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;
                  var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};
                  ttq.load('${tiktokPixelId}');
                  ttq.page();
                }(window, document, 'ttq');
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <AnnouncementBar />
        {children}
      </body>
    </html>
  );
}
