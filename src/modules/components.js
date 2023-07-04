import { h, render } from 'vue'
import dialog from '@/components/Dialog.vue'

export function dialogMsg(content, duration = 5000) {
  const destroy = () => render(null, document.body)
  const vNode = h(dialog, {
    content,
    duration,
    destroy
  })
  render(vNode, document.body)
}