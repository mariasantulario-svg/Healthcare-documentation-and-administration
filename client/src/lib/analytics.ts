/**
 * Google Analytics 4 (GA4) - opcional.
 * Para ver visitas: crea una propiedad en https://analytics.google.com,
 * obtén el Measurement ID (G-XXXXXXXXXX) y en Render añade la variable de entorno:
 *   VITE_GA_MEASUREMENT_ID = G-XXXXXXXXXX
 * Luego redeploy. Las visitas aparecerán en el panel de Google Analytics.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

export function initAnalytics(): void {
  if (!MEASUREMENT_ID || typeof window === "undefined") return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  (window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void }).dataLayer =
    (window as unknown as { dataLayer?: unknown[] }).dataLayer || [];
  (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = function gtag(
    ...args: unknown[]
  ) {
    ((window as unknown as { dataLayer: unknown[] }).dataLayer as unknown[]).push(args);
  };
  (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("js", new Date());
  (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("config", MEASUREMENT_ID, {
    send_page_view: true,
  });
}

export function pageView(path: string, title?: string): void {
  if (!MEASUREMENT_ID || typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag) {
    gtag("event", "page_view", {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

export const isAnalyticsEnabled = (): boolean => !!MEASUREMENT_ID;
