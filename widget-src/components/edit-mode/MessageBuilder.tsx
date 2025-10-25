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
    {
      // базовые поля сообщения
      dir,
      type,
      text,
      name,
      extension,
      size,
      buttons,
      hidePreview,
      isImg,
      imgSrc,

      // время
      messageTime,

      // реакции
      reactionEnabled,
      reactionEmoji,
      reactionTime,
      rxnAvatarSrc,
    },
    setEditorState,
    setChatState,
  ] = editorManager

  // правый сайдбар (глобальные настройки сцены)
  const [showHeaderActions, setShowHeaderActions] = useSyncedState<boolean>("showHeaderActions", true)
  const [showNewUserCard, setShowNewUserCard] = useSyncedState<boolean>("showNewUserCard", true)
  const [profileName, setProfileName] = useSyncedState<string>("profileName", "Random User")
  const [profileCountry, setProfileCountry] = useSyncedState<string>("profileCountry", "🇳🇬 Nigeria")
  const [profileReg, setProfileReg] = useSyncedState<string>("profileReg", "January 2024")

  const [headerUsername, setHeaderUsername] = useSyncedState<string>("headerUsername", "Random User")
  const [headerLastSeen, setHeaderLastSeen] = useSyncedState<string>("headerLastSeen", "last seen just now")
  const [statusTime, setStatusTime] = useSyncedState<string>("statusTime", "9:41")

  const [batteryPercent, setBatteryPercent] = useSyncedState<number>("batteryPercent", 100)

  // разделитель дней
  const [dayState, setDayState] = useDynamicState<{ value: string }>({ value: "Сегодня" })

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
  const setBatterySafe = (val: number) => setBatteryPercent(clamp(Math.round(val || 0), 0, 100))

  const resetInputs = () => {
    Object.entries(EDITOR_STATE).map(([key, value]) =>
      setEditorState(key as keyof EditorState, value as never),
    )
  }

  // кнопки в сообщении
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
      buttons.map((r, i) => (i === row ? [...r, { id: nextId, text: `Кнопка ${row + 1}-${nextId}`, hasRef: false }] : r)),
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
    setEditorState("buttons", [...buttons, [{ id: 1, text: `Кнопка ${buttons.length}-1`, hasRef: false }]])

  // загрузки из Shared Plugin Data (vault)
  const loadMessageImageFromVault = () => {
    const page = figma.currentPage
    try {
      const n = parseInt(page.getSharedPluginData("tg_vault", "messageImageChunks") || "0", 10)
      if (!n || Number.isNaN(n)) return figma.notify("В хранилище нет изображения сообщения")
      let out = ""
      for (let i = 0; i < n; i++) out += page.getSharedPluginData("tg_vault", `messageImageDataURL_${i}`) || ""
      if (out && out.startsWith("data:image/")) {
        setEditorState("imgSrc", out)
        figma.notify("Изображение сообщения загружено")
      } else figma.notify("Не найдено корректное изображение сообщения")
    } catch (e) {
      console.warn("loadMessageImageFromVault", e)
      figma.notify("Ошибка чтения изображения сообщения")
    }
  }

  const loadReactionAvatarFromVault = () => {
    const page = figma.currentPage
    try {
      // сначала пробуем специальные ключи reactionAvatar*, иначе fallback на messageImage*
      let n = parseInt(page.getSharedPluginData("tg_vault", "reactionAvatarChunks") || "0", 10)
      let prefix = "reactionAvatarDataURL_"
      if (!n || Number.isNaN(n)) {
        n = parseInt(page.getSharedPluginData("tg_vault", "messageImageChunks") || "0", 10)
        prefix = "messageImageDataURL_"
      }
      if (!n || Number.isNaN(n)) return figma.notify("В хранилище нет аватарки реакции")

      let out = ""
      for (let i = 0; i < n; i++) out += page.getSharedPluginData("tg_vault", `${prefix}${i}`) || ""
      if (out && out.startsWith("data:image/")) {
        setEditorState("rxnAvatarSrc", out)
        figma.notify("Аватарка реакции загружена")
      } else figma.notify("Не найдена корректная аватарка реакции")
    } catch (e) {
      console.warn("loadReactionAvatarFromVault", e)
      figma.notify("Ошибка чтения аватарки реакции")
    }
  }

  const addMessageToChat = () => {
    // циклим направление (In ↔ Out) для быстрой набивки примеров
    setEditorState("dir", (prev) => ((prev + 1) % EDITOR_INPUTS.dir.map.length) as typeof prev)

    // приоритет времени: если включены реакции и задано reactionTime — берём его, иначе общее messageTime
    const computedTime =
      (reactionEnabled && (reactionTime || "").trim())
        ? reactionTime
        : ((messageTime || "").trim() ? messageTime : undefined)

    const base: Message = {
      dir, type, text, name, extension, size, buttons, isImg, imgSrc,
      time: computedTime,
    }

    const msg: WithReaction<Message> = reactionEnabled
      ? { ...base, reaction: { emoji: (reactionEmoji ?? "❤️"), avatarSrc: rxnAvatarSrc || undefined } }
      : base

    setChatState("messages", (prev) => {
      const all = [...(prev ?? [])]
      const last = all.pop()
      if (typeof last !== "undefined" && Array.isArray(last) && last[0]?.dir === dir) {
        last.push(msg as Message); all.push(last)
      } else {
        if (typeof last !== "undefined") all.push(last)
        all.push([msg as Message])
      }
      return all
    })
  }

  // разделитель дней
  const addDayDivider = () => {
    const label = (dayState.value || "").trim()
    if (!label) return figma.notify("Подпись разделителя пуста")
    setChatState("messages", (prev) => {
      const all = [...(prev ?? [])]
      all.push({ kind: "day", label } as any)
      return all
    })
    figma.notify(`Разделитель добавлен: ${label}`)
  }

  // цвета
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

  // секция редактирования кнопок
  function ButtonsSection() {
    return (
      <AutoLayout name="Buttons Container" cornerRadius={8} overflow="visible" direction="vertical" spacing={12} width="fill-parent">
        {buttons.map(
          (buttonsRow, rowIndex) =>
            buttonsRow.length > 0 && (
              <ButtonsRow key={rowIndex}>
                <ButtomSmall onEvent={() => removeButtonFromRow(rowIndex, buttonsRow.length - 1)} icon="minus" tooltip="Удалить кнопку из ряда" colorPalette={color} />
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
                <ButtomSmall onEvent={() => addButtonToRow(rowIndex, buttonsRow.length + 1)} tooltip="Добавить кнопку в ряд" colorPalette={color} />
              </ButtonsRow>
            ),
        )}
        <ButtonsRow>
          <ButtomSmall onEvent={() => addRowOfButtons()} colorPalette={color}>Добавить ряд кнопок</ButtomSmall>
        </ButtonsRow>
      </AutoLayout>
    )
  }

  // UI
  return (
    renderElement && (
      <AutoLayout
        name="MessageBuilder"
        positioning="absolute"
        overflow="visible"
        width={390}
        y={16}
        x={{ type: "right", offset: -25 - 390 }}
        effect={[
          { type: "drop-shadow", color: "#00000059", offset: { x: 0, y: 3 }, blur: 26, showShadowBehindNode: false },
          { type: "drop-shadow", color: "#00000040", offset: { x: 0, y: 4 }, blur: 108.5, showShadowBehindNode: false },
        ]}
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
        {/* Заголовок */}
        <Section horizontalAlignItems={"center"}>
          <Text name="title" fill={color.text.default} verticalAlignText="center" lineHeight={22} fontSize={22} fontWeight={600} height={46}>
            Новое сообщение
          </Text>
          <Icon
            tooltip={hidePreview ? "Показать превью" : "Скрыть превью"}
            onEvent={() => setEditorState("hidePreview", (bool) => !bool)}
            icon={hidePreview ? "show" : "hide"}
            theme={theme}
            opacity={hidePreview ? 1 : 0.5}
            x={{ type: "left", offset: 6 }}
            color={hidePreview ? (color.surface.primaryHover as string) : (color.text.default as string)}
          />
          <Icon tooltip="Сбросить поля" onEvent={() => resetInputs()} icon={"reset"} theme={theme} color={color.text.default as string} />
        </Section>

        {/* 1. Направление и тип */}
        <Section>
          <Label colorPalette={color}>Направление</Label>
          <Selector
            onEvent={(_, i) => setEditorState("dir", i)}
            value={dir}
            options={["Входящее", "Исходящее"]}
            tips={["Слева (полупрозрачный фон)", "Справа (цветной фон)"]}
            colorPalette={color}
          />
        </Section>

        <Section>
          <Label colorPalette={color}>Тип сообщения</Label>
          <Selector
            onEvent={(_, i) => setEditorState("type", i)}
            value={type}
            options={["Файл", "Текст", "Картинка"]}
            tips={["Файл/картинка с метаданными", "Обычный текст", "Фото с подписью"]}
            colorPalette={color}
          />
        </Section>

        {/* 2. Время */}
        <Section>
          <Label colorPalette={color}>Время (для статуса)</Label>
          <TextInput
            onEvent={(e) => setEditorState("messageTime", e.characters)}
            value={messageTime ?? "10:15"}
            placeholder="например, 10:15"
            colorPalette={color}
          />
          <Text fill={color.text.default} opacity={0.6} fontSize={12}>
            Если включены реакции и задано «Время реакции», оно имеет приоритет.
          </Text>
        </Section>

        {/* 3. Содержимое */}
        <Section hidden={type !== 1}>
          <Label colorPalette={color}>Текст</Label>
          <TextInput
            onEvent={(e) => setEditorState("text", e.characters)}
            value={text}
            placeholder="Введите текст сообщения…"
            isResizable={true}
            colorPalette={color}
          />
          <ButtonsSection />
        </Section>

        <Section hidden={type !== 0}>
          <Label colorPalette={color}>Файл / изображение</Label>
          <TextInput onEvent={(e) => setEditorState("name", e.characters)} value={name} placeholder="Имя файла" colorPalette={color} />
          <TextInput onEvent={(e) => setEditorState("extension", e.characters)} value={extension} placeholder="Расширение (например, .png)" colorPalette={color} />
          <TextInput onEvent={(e) => setEditorState("size", e.characters)} value={size} placeholder="Размер (например, 2.1)" colorPalette={color} />
          <ButtonsSection />
          <AutoLayout onClick={() => setEditorState("isImg", (prev) => !prev)} tooltip="Предпросмотр как изображение" width={"fill-parent"} spacing={8} padding={{ vertical: 0, horizontal: 16 }} verticalAlignItems="center">
            <Text name="title" fill={color.text.default} width="fill-parent" lineHeight={22} fontSize={17} fontWeight={500}>
              Сжатая картинка
            </Text>
            <Slider onEvent={console.log} value={isImg} colorPalette={color} />
          </AutoLayout>
        </Section>

        <Section hidden={type !== 2}>
          <Label colorPalette={color}>Картинка с подписью</Label>
          <TextInput onEvent={(e) => setEditorState("text", e.characters)} value={text} placeholder="Подпись (необязательно)" isResizable={true} colorPalette={color} />
          <ButtonsSection />
          <Button onEvent={loadMessageImageFromVault} colorPalette={color}>Загрузить фото из Vault</Button>
          <Text name="img-hint" fill={color.text.default} opacity={imgSrc ? 0.8 : 0.5} fontSize={12}>
            {imgSrc ? "Фото загружено" : "Фото не загружено"}
          </Text>
        </Section>

        {/* 4. Реакции */}
        <Section>
          <Label colorPalette={color}>Реакции (Telegram)</Label>
          <ButtonsRow>
            <ButtomSmall onEvent={() => setEditorState("reactionEnabled", (v: boolean) => !v)} colorPalette={color}>
              {reactionEnabled ? "Вкл" : "Выкл"}
            </ButtomSmall>
            <TextInput
              onEvent={(e) => setEditorState("reactionEmoji", e.characters)}
              value={reactionEmoji ?? "❤️"}
              placeholder="Эмодзи (напр. ❤️, 👍, 😂)"
              colorPalette={color}
            />
            <TextInput
              onEvent={(e) => setEditorState("reactionTime", e.characters)}
              value={reactionTime ?? "10:15"}
              placeholder="Время реакции (напр. 10:15)"
              colorPalette={color}
            />
          </ButtonsRow>
          <ButtonsRow>
            <Button onEvent={loadReactionAvatarFromVault} colorPalette={color}>Загрузить аватар реакции из Vault</Button>
          </ButtonsRow>
          <Text name="rxn-img-hint" fill={color.text.default} opacity={rxnAvatarSrc ? 0.8 : 0.5} fontSize={12}>
            {rxnAvatarSrc ? "Аватарка загружена" : "Аватарка не загружена"}
          </Text>
        </Section>

        {/* 5. Расширенные настройки сцены */}
        <Section><Label isCollapsable={true} colorPalette={color}>Дополнительно</Label></Section>

        <Section>
          <Label colorPalette={color}>Кнопки «Заблокировать / Добавить в контакты»</Label>
          <Button onEvent={() => setShowHeaderActions((v) => !v)} colorPalette={color}>{showHeaderActions ? "Вкл" : "Выкл"}</Button>
        </Section>

        <Section>
          <Label colorPalette={color}>Карточка «Новый пользователь»</Label>
          <Button onEvent={() => setShowNewUserCard((v) => !v)} colorPalette={color}>{showNewUserCard ? "Вкл" : "Выкл"}</Button>
        </Section>

        <Section>
          <TextInput onEvent={(e) => setProfileName(e.characters)} value={profileName} placeholder="Имя профиля" colorPalette={color} />
          <TextInput onEvent={(e) => setProfileCountry(e.characters)} value={profileCountry} placeholder="Страна" colorPalette={color} />
          <TextInput onEvent={(e) => setProfileReg(e.characters)} value={profileReg} placeholder="Регистрация (месяц год)" colorPalette={color} />
        </Section>

        <Section>
          <Label colorPalette={color}>Хедер и статус</Label>
          <TextInput onEvent={(e) => setHeaderUsername(e.characters)} value={headerUsername} placeholder="Ник в шапке" colorPalette={color} />
          <TextInput onEvent={(e) => setHeaderLastSeen(e.characters)} value={headerLastSeen} placeholder="last seen…" colorPalette={color} />
          <TextInput onEvent={(e) => setStatusTime(e.characters)} value={statusTime} placeholder="Время статус-бара (9:41)" colorPalette={color} />
        </Section>

        <Section>
          <Label colorPalette={color}>Батарея</Label>
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
            1–20% — красная заливка и белые цифры; 0% — пустая с красными цифрами.
          </Text>
        </Section>

        {/* 6. Разделитель дней */}
        <Section>
          <Label colorPalette={color}>Разделитель дня</Label>
          <TextInput onEvent={(e) => setDayState("value", e.characters)} value={dayState.value} placeholder="Сегодня / Вчера / 1 ноября" colorPalette={color} />
          <Button onEvent={addDayDivider} colorPalette={color}>Добавить разделитель</Button>
        </Section>

        {/* Финальная кнопка */}
        <Button onEvent={addMessageToChat} colorPalette={color}>Добавить в чат</Button>
      </AutoLayout>
    )
  )
}
