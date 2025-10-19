/* This is a Telegram bot chat generator. */
// Dependencies
const { widget } = figma
const { AutoLayout } = widget
// Components
import { useWidgetMenu, useDynamicState } from "@/hooks"
import { PhoneFrame, Interface, MessagesLayout, MessagePreview } from "@/components/display"
import { MessageBuilder } from "@/components/edit-mode"
import { REPLIES, CHATS } from "@/constants"

function Widget() {
  // добавлены avatarSrc, wallpaperSrc
  const {
    chatId, displayMode, viewport, theme, isEditMode,
    avatarHash, wallpaperHash,
    avatarSrc, wallpaperSrc,
  } = useWidgetMenu()

  const [chatState, setChatState] = useDynamicState<ChatState>({ messages: CHATS[chatId] })
  const [editorState, setEditorState] = useDynamicState<EditorState>({ ...REPLIES[chatId], hidePreview: false })
  const showPreview = isEditMode && !editorState.hidePreview

  return (
    <AutoLayout name="Widget Container" width={"hug-contents"} height={"hug-contents"} overflow="visible">
      <PhoneFrame renderElements={displayMode <= 0} theme={theme}>
        <Interface
          renderElements={displayMode <= 1}
          chatId={chatId}
          viewport={viewport}
          theme={theme}
          wallpaperHash={wallpaperHash}
          avatarHash={avatarHash}
          wallpaperSrc={wallpaperSrc}
          avatarSrc={avatarSrc}
        >
          <MessagesLayout renderElements={displayMode <= 2} messages={chatState.messages} theme={theme}>
            {showPreview && <MessagePreview editorState={editorState} theme={theme} />}
          </MessagesLayout>
        </Interface>
      </PhoneFrame>

      <MessageBuilder renderElement={isEditMode} editorManager={[editorState, setEditorState, setChatState]} theme={theme} />
    </AutoLayout>
  )
}


widget.register(Widget)
