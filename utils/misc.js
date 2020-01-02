export async function pCopyTextToClipboard(text) {
  function doCompatabilityCopy() {
    // eslint-disable-next-line no-console
    console.warn('Compatibility Copy not implemented')
    // const $temp = $(
    // eslint-disable-next-line max-len
    //   `<textarea id="copy-temp" style="position: fixed; top: -1000px; left: -1000px; width: 1px; height: 1px;">${text}</textarea>`
    // )
    // $(`body`).append($temp)
    // $temp.select()
    // document.execCommand('Copy')
    // $temp.remove()
  }

  if (navigator && navigator.permissions) {
    try {
      const access = await navigator.permissions.query({ name: 'clipboard-write' })
      if (access.state === 'granted' || access.state === 'prompt') {
        await navigator.clipboard.writeText(text)
      } else doCompatabilityCopy()
    } catch (e) {
      doCompatabilityCopy()
    }
  } else doCompatabilityCopy()
}

export default {
  pCopyTextToClipboard
}
