let initialized = false

export function initGA(measurementId?: string) {
  const id = measurementId || localStorage.getItem('ga4.id') || ''
  if (!id || initialized) return
  initialized = true

  // Load gtag lazily
  const load = () => {
    const s = document.createElement('script')
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    s.async = true
    s.defer = true
    document.head.appendChild(s)

    const inline = document.createElement('script')
    inline.innerHTML = `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\nwindow.gtag = gtag;\ngtag('js', new Date());\ngtag('config', '${id}');`
    document.head.appendChild(inline)
  }

  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(load)
  } else {
    setTimeout(load, 1000)
  }
}
