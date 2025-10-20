import { EDITOR_INPUTS } from "@/constants"

declare global {
  /** Message Props*/
  type Message = {
    dir: IndexesOf<typeof EDITOR_INPUTS.dir.map>
    type: IndexesOf<typeof EDITOR_INPUTS.type.map>
    text: string
    name: string
    size: string
    extension: string
    isImg: boolean
    /** dataURL для изображения сообщения из плагина-вальта */
    imgSrc?: string
    buttons: { id: number; text: string; hasRef: boolean }[][]
  }

  /** Messages */
  type ChatState = { messages?: (Message[] | undefined)[] }

  /** Editor Preference */
  type EditorState = Message & { hidePreview: boolean }
}
