/** Mobile sticky CTA visibility — dispatched by MobileCTABar */
export const MOBILE_CTA_EVENT = 'repause:mobile-cta-visible'

export function dispatchMobileCtaVisible(visible: boolean) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(MOBILE_CTA_EVENT, { detail: { visible } }))
}
