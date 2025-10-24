// widget-src/components/edit-mode/MessageBuilder.tsx

// Dependencies
const { AutoLayout, Text, useSyncedState } = figma.widget
import { remapTokens } from "@/utils"
import { useDynamicState, type SetterProp } from "@/hooks"
import { EDITOR_STATE, EDITOR_INPUTS } from "@/constants"
import {
  Section,
  Label,
  ButtonsRow,
  Button,
  ButtomSmall,
  ChatButtonEditable,
  Selector,
  TextInput,
  Icon,
  Slider,
} from "@/components/edit-mode/atoms"

interface MessageBuilderProps extends Partial<AutoLayoutProps>, ReqCompProps {
  renderElement: boolean
  editorManager: [EditorState, SetterProp<EditorState>, SetterProp<ChatState>]
}

export function MessageBuilder({ editorManager, renderElement, theme, ...props }: MessageBuilderProps) {
  const [
    { dir, type, text, name, extension, size, buttons, hidePreview, isImg, imgSrc },
    setEditorState,
    setChatState,
  ] = editorManager

  // === Глобальные настройки (правые переключатели/поля) ======================
  const [showHeaderActions, setShowHeaderActions] = useSyncedState<boolean>("showHeaderActions", true)
  const [showNewUserCard, setShowNewUserCard] = useSyncedState<boolean>("showNewUserCard", true)
  const [profileName, setProfileName] = useSyncedState<string>("profileName", "Random User")
  const [profileCountry, setProfileCountry] = useSyncedState<string>("profileCountry", "🇳🇬 Nigeria")
  const [profileReg, setProfileReg] = useSyncedState<string>("profileReg", "January 2024")

  // НОВОЕ: поля хедера/статуса
  const [headerUsername, setHeaderUsername] = useSyncedState<string>("headerUsername", "Random User")
  const [headerLastSeen, setHeaderLastSeen] = useSyncedState<string>("headerLastSeen", "last seen just now")
  const [statusTime, setStatusTime] = useSyncedState<string>("statusTime", "9:41")

  // НОВОЕ: процент батареи для статус-бара (читается IosHeaderStatus)
  const [batteryPercent, setBatteryPercent] = useSyncedState<number>("batteryPercent", 100)

  // Day separator
  const [dayState, setDayState] = useDynamicState<{ value: string }>({ value: "Today" })
  // ==========================================================================

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
  const setBatterySafe = (val: number) => setBatteryPercent(clamp(Math.round(val || 0), 0, 100))

  const resetInputs = () => {
    Object.entries(EDITOR_STATE).map(([key, value]) =>
      setEditorState(key as keyof EditorState, value as never),
    )
  }

  const updateButton = (row: number, id: number, newvals: Partial<Message["buttons"][number][number]>) => {
    setEditorState(
      "buttons",
      buttons.map((buttonRow, rowIndex) =>
        rowIndex === row
          ? buttonRow.map((button, buttonIndex) =>
              buttonIndex === id ? { ...button, ...newvals } : button,
            )
          : buttonRow,
      ),
    )
  }
  const addButtonToRow = (row: number, nextId: number) => {
    setEditorState(
      "buttons",
      buttons.map((r, i) => (i === row ? [...r, { id: nextId, text: `Button ${row + 1}-${nextId}`, hasRef: false }] : r)),
    )
  }
  const removeButtonFromRow = (row: number, id: number) => {
    if (buttons[row].length === 1) {
      setEditorState("buttons", buttons.filter((_, i) => i !== row))
    } else {
      setEditorState("buttons", buttons.map((r, i) => (i === row ? r.filter((b) => b.id !== id) : r)))
    }
  }
  const addRowOfButtons = () =>
    setEditorState("buttons", [...buttons, [{ id: 1, text: `Button ${buttons.length}-1`, hasRef: false }]])

  /** Read message image from SPD tg_vault */
  const loadMessageImageFromVault = () => {
    const page = figma.currentPage
    try {
      const n = parseInt(page.getSharedPluginData("tg_vault", "messageImageChunks") || "0", 10)
      if (!n || Number.isNaN(n)) return figma.notify("No Message Image in vault")
      let out = ""
      for (let i = 0; i < n; i++) out += page.getSharedPluginData("tg_vault", `messageImageDataURL_${i}`) || ""
      if (out && out.startsWith("data:image/")) {
        setEditorState("imgSrc", out)
        figma.notify("Message Image loaded")
      } else figma.notify("Message Image not found or invalid")
    } catch (e) {
      console.warn("loadMessageImageFromVault", e)
      figma.notify("Failed to read Message Image")
    }
  }

  const addMessageToChat = () => {
    setEditorState("dir", (prev) => ((prev + 1) % EDITOR_INPUTS.dir.map.length) as typeof prev)
    const newMessage: Message = { dir, type, text, name, extension, size, buttons, isImg, imgSrc }
    setChatState("messages", (prev) => {
      const all = [...(prev ?? [])]
      const last = all.pop()
      if (typeof last !== "undefined" && Array.isArray(last) && last[0]?.dir === dir) {
        last.push(newMessage); all.push(last)
      } else {
        if (typeof last !== "undefined") all.push(last)
        all.push([newMessage])
      }
      return all
    })
  }

  // Day separator → отдельный элемент ленты
  const addDayDivider = () => {
    const label = (dayState.value || "").trim()
    if (!label) return figma.notify("Day label is empty")
    setChatState("messages", (prev) => {
      const all = [...(prev ?? [])]
      all.push({ kind: "day", label } as any)
      return all
    })
    figma.notify(`Day divider added: ${label}`)
  }

  const color = remapTokens({
    surface: {
      primaryHover: { dark: "#EAFFC8", light: "#567FE7" },
      primary: { dark: "#D3FF8D", light: "#2851B7" },
      primary30: { dark: "#D3FF8D4D", light: "#2851B74D" },
      telegramButton: { dark: "#FFF3", light: "#24242487" },
      action: { dark: "#313131", light: "#313131" },
      actionHover: { dark: "#444444", light: "#444444" },
      inputBg: { dark: "#0000004D", light: "#00000015" },
      bg: { dark: "#252525", light: "#FFFFFF" },
    },
    text: {
      default: { dark: "#FFFFFF", light: "#000" },
      inverted: { dark: "#000", light: "#FFF" },
      black: { dark: "#000", light: "#000" },
      white: { dark: "#FFF", light: "#FFF" },
    },
  })[theme]

  const onOff = (v: boolean) => (v ? "On" : "Off")

  function ButtonsSection() {
    return (
      <AutoLayout name="Buttons Container" cornerRadius={8} overflow="visible" direction="vertical" spacing={12} width="fill-parent">
        {buttons.map(
          (buttonsRow, rowIndex) =>
            buttonsRow.length > 0 && (
              <ButtonsRow key={rowIndex}>
                <ButtomSmall onEvent={() => removeButtonFromRow(rowIndex, buttonsRow.length - 1)} icon="minus" tooltip="Remove Button From Row" colorPalette={color} />
                {buttonsRow.map((button, buttonIndex) => (
                  <ChatButtonEditable
                    key={buttonIndex}
                    value={button.text}
                    onEvent={(e) => updateButton(rowIndex, buttonIndex, { text: e.characters })}
                    name="chat-button"
                    width="fill-parent"
                    colorPalette={color}
                  />
                ))}
                <ButtomSmall onEvent={() => addButtonToRow(rowIndex, buttonsRow.length + 1)} tooltip="Add Button To Row" colorPalette={color} />
              </ButtonsRow>
            ),
        )}
        <ButtonsRow>
          <ButtomSmall onEvent={() => addRowOfButtons()} colorPalette={color}>Add Row of Buttons</ButtomSmall>
        </ButtonsRow>
      </AutoLayout>
    )
  }

  return (
    renderElement && (
      <AutoLayout
        name="MessageBuilder"
        positioning="absolute"
        overflow="visible"
        width={390}
        y={16}
        x={{ type: "right", offset: -25 - 390 }}
        effect={[{ type: "drop-shadow", color: "#00000059", offset: { x: 0, y: 3 }, blur: 26, showShadowBehindNode: false },
                 { type: "drop-shadow", color: "#00000040", offset: { x: 0, y: 4 }, blur: 108.5, showShadowBehindNode: false }]}
        fill={color.surface.bg}
        cornerRadius={16}
        direction="vertical"
        spacing={24}
        padding={{ vertical: 32, horizontal: 16 }}
        height={"hug-contents"}
        horizontalAlignItems="center"
        stroke={color.surface.primary30}
        strokeAlign="outside"
        strokeDashPattern={[16, 8]}
        {...props}
      >
        {/* Title */}
        <Section horizontalAlignItems={"center"}>
          <Text name="title" fill={color.text.default} verticalAlignText="center" lineHeight={22} fontSize={22} fontWeight={600} height={46}>Add New Message</Text>
          <Icon tooltip={hidePreview ? "Show Preview Message" : "Hide Preview Message"} onEvent={() => setEditorState("hidePreview", (bool) => !bool)}
                icon={hidePreview ? "show" : "hide"} theme={theme} opacity={hidePreview ? 1 : 0.5} x={{ type: "left", offset: 6 }}
                color={hidePreview ? (color.surface.primaryHover as string) : (color.text.default as string)} />
          <Icon tooltip="Reset New Message Inputs" onEvent={() => resetInputs()} icon={"reset"} theme={theme} color={color.text.default as string} />
        </Section>

        {/* Direction */}
        <Section>
          <Label colorPalette={color}>Message Direction</Label>
          <Selector onEvent={(_, i) => setEditorState("dir", i)} value={dir} options={[...EDITOR_INPUTS.dir.map]} tips={[...EDITOR_INPUTS.dir.tips]} colorPalette={color} />
        </Section>

        {/* Type */}
        <Section>
          <Label colorPalette={color}>Message Type</Label>
          <Selector onEvent={(_, i) => setEditorState("type", i)} value={type} options={[...EDITOR_INPUTS.type.map]} tips={[...EDITOR_INPUTS.type.tips]} colorPalette={color} />
        </Section>

        {/* Text / File / Image секции как были */}
        <Section hidden={type !== 1}>
          <Label colorPalette={color}>Message Content</Label>
          <TextInput onEvent={(e) => setEditorState("text", e.characters)} value={text} placeholder="Text Message..." isResizable={true} colorPalette={color} />
          <ButtonsSection />
        </Section>

        <Section hidden={type !== 0}>
          <Label colorPalette={color}>Image Details</Label>
          <TextInput onEvent={(e) => setEditorState("name", e.characters)} value={name} placeholder="Image/ File Name" colorPalette={color} />
          <TextInput onEvent={(e) => setEditorState("extension", e.characters)} value={extension} placeholder="Image/ File Extension" colorPalette={color} />
          <TextInput onEvent={(e) => setEditorState("size", e.characters)} value={size} placeholder="Image/ File Size" colorPalette={color} />
          <ButtonsSection />
          <AutoLayout onClick={() => setEditorState("isImg", (prev) => !prev)} tooltip="File Preview Is Image" width={"fill-parent"} spacing={8} padding={{ vertical: 0, horizontal: 16 }} verticalAlignItems="center">
            <Text name="title" fill={color.text.default} width="fill-parent" lineHeight={22} fontSize={17} fontWeight={500}>Compressed Image</Text>
            <Slider onEvent={console.log} value={isImg} colorPalette={color} />
          </AutoLayout>
        </Section>

        <Section hidden={type !== 2}>
          <Label colorPalette={color}>Message Content</Label>
          <TextInput onEvent={(e) => setEditorState("text", e.characters)} value={text} placeholder="Text Message..." isResizable={true} colorPalette={color} />
          <ButtonsSection />
          <Button onEvent={loadMessageImageFromVault} colorPalette={color}>Load Image from Vault</Button>
          <Text name="img-hint" fill={color.text.default} opacity={imgSrc ? 0.8 : 0.5} fontSize={12}>{imgSrc ? "Image loaded" : "No image loaded"}</Text>
        </Section>

        {/* Advanced header */}
        <Section><Label isCollapsable={true} colorPalette={color}>Advanced</Label></Section>

        {/* Переключатели и поля карточки */}
        <Section>
          <Label colorPalette={color}>Show “Block / Add to Contacts”</Label>
          <Button onEvent={() => setShowHeaderActions((v) => !v)} colorPalette={color}>{showHeaderActions ? "On" : "Off"}</Button>
        </Section>

        <Section>
          <Label colorPalette={color}>Show New User Card</Label>
          <Button onEvent={() => setShowNewUserCard((v) => !v)} colorPalette={color}>{showNewUserCard ? "On" : "Off"}</Button>
        </Section>

        <Section>
          <TextInput onEvent={(e) => setProfileName(e.characters)} value={profileName} placeholder="Random User" colorPalette={color} />
          <TextInput onEvent={(e) => setProfileCountry(e.characters)} value={profileCountry} placeholder="🇳🇬 Nigeria" colorPalette={color} />
          <TextInput onEvent={(e) => setProfileReg(e.characters)} value={profileReg} placeholder="January 2024" colorPalette={color} />
        </Section>

        {/* НОВОЕ: поля хедера и статус-бара */}
        <Section>
          <Label colorPalette={color}>Header & Status</Label>
          <TextInput onEvent={(e) => setHeaderUsername(e.characters)} value={headerUsername} placeholder="Header Username" colorPalette={color} />
          <TextInput onEvent={(e) => setHeaderLastSeen(e.characters)} value={headerLastSeen} placeholder="last seen recently" colorPalette={color} />
          <TextInput onEvent={(e) => setStatusTime(e.characters)} value={statusTime} placeholder="9:41" colorPalette={color} />
        </Section>

        {/* НОВОЕ: Battery */}
        <Section>
          <Label colorPalette={color}>Battery</Label>
          <AutoLayout width={"fill-parent"} spacing={8} verticalAlignItems="center">
            <ButtomSmall onEvent={() => setBatterySafe(batteryPercent - 10)} tooltip="-10%" colorPalette={color}>-10</ButtomSmall>
            <ButtomSmall onEvent={() => setBatterySafe(batteryPercent - 1)} tooltip="-1%" colorPalette={color}>-1</ButtomSmall>
            <TextInput
              onEvent={(e) => {
                const num = parseInt(e.characters.replace(/[^\d]/g, ""), 10)
                setBatterySafe(Number.isFinite(num) ? num : 0)
              }}
              value={String(clamp(batteryPercent, 0, 100))}
              placeholder="0–100"
              colorPalette={color}
            />
            <ButtomSmall onEvent={() => setBatterySafe(batteryPercent + 1)} tooltip="+1%" colorPalette={color}>+1</ButtomSmall>
            <ButtomSmall onEvent={() => setBatterySafe(batteryPercent + 10)} tooltip="+10%" colorPalette={color}>+10</ButtomSmall>
          </AutoLayout>
          <Text fill={color.text.default} opacity={0.6} fontSize={12}>
            1–20% будет красной заливкой и белыми цифрами; 0% — пустая с красными цифрами.
          </Text>
        </Section>

        {/* Day separator */}
        <Section>
          <Label colorPalette={color}>Day Separator</Label>
          <TextInput onEvent={(e) => setDayState("value", e.characters)} value={dayState.value} placeholder="Today / 1 November / Yesterday" colorPalette={color} />
          <Button onEvent={addDayDivider} colorPalette={color}>Add Day Separator</Button>
        </Section>

        <Button onEvent={addMessageToChat} colorPalette={color}>Add To Chat</Button>
      </AutoLayout>
    )
  )
}
