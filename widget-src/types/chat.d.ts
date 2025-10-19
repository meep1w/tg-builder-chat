import { EDITOR_INPUTS } from "@/constants"

declare global {
   /** Message Props*/
   type Message = {
      /** Messagge direction (side) recipient.. */
      dir: IndexesOf<typeof EDITOR_INPUTS.dir.map>
      type: IndexesOf<typeof EDITOR_INPUTS.type.map>
      text: string
      name: string
      size: string
      extension: string
      isImg: boolean
      buttons: {
         id: number
         text: string
         hasRef: boolean
      }[][]
   }

   /** Messages
    * @description 2D Array of Out & In Messages
    */
   type ChatState = {
      /** Array of previous messages presetted [bot, friends, none] */
      // chats: (Message[] | undefined)[][]
      messages?: (Message[] | undefined)[]
   }

   /** @param `hidePreview` - Editor Preference, hides preview from chat  */
   type EditorState = Message & { hidePreview: boolean }
}
