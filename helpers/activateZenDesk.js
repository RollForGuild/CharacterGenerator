export default function activateZenDesk () {
  if (typeof window !== 'undefined' && window.zE) {
    window.zE(() => {
      window.zE.activate()
    })
  }
}
