// Dependencies
const { Image, AutoLayout, Text } = figma.widget
import { PreviewImage64 } from "@/assets/base64"
import { remapTokens } from "@/utils"
import { EDITOR_INPUTS } from "@/constants"
import { StatusAtom, TailAtom } from "@/components/ui/atoms"
import { FILE_LIGHT_IN64, FILE_LIGHT_OUT64, FILE_DARK64 } from "@/assets/base64/Icons"

const ICON_MAP = { light: [FILE_LIGHT_IN64, FILE_LIGHT_OUT64], dark: [FILE_DARK64, FILE_DARK64] }

type PropByType = [
  { type: 0; src?: ""; isImg: boolean; name: string; size: string; extension?: string },
  { type: 1; text: string },
  { type: 2; src?: ""; text: string },
]
interface MessageProps extends ReqCompProps, Partial<AutoLayoutProps> { dir: Message["dir"]; type: Message["type"] }

// helpers
function b64ToUint8(dataURL: string): Uint8Array {
  const b64 = dataURL.split(",")[1] ?? ""
  const bin = atob(b64)
  const u8 = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)
  return u8
}
function getImageSize(dataURL: string): { w: number; h: number } {
  try {
    const img = figma.createImage(b64ToUint8(dataURL))
    return { w: img.width, h: img.height }
  } catch {
    return { w: 0, h: 0 }
  }
}

// --- layout / measurement constants ---
const LAYOUT = {
  tailX: ["left", "right"] as const,
  radius: [
    { topLeft: 16, topRight: 18, bottomRight: 18, bottomLeft: 18 },
    { topLeft: 18, topRight: 16, bottomRight: 18, bottomLeft: 18 },
  ] as const,
  maxImageW: 276,
  minImageW: 118,
  minImageH: 118,
  textMaxW: 250, // даёт ~31 цифру / 33 lower / 27 UPPER
  statusWidthByDir: [28, 43] as const, // in: только время, out: время+галочки
  perLine: { lower: 33, digits: 31, upper: 27 },
}

// Matte для IN (dir=0)
const MATTE_BG = { r: 0x21 / 255, g: 0x21 / 255, b: 0x21 / 255, a: 0.54 } // #212121 @54%
const MATTE_TEXT = "#FFFFFF"
const MATTE_LABEL = "#B1B8C2"

// для кириллицы и латиницы
const UPPER_RE = /^[A-ZА-ЯЁ]+$/
const DIGIT_RE = /^[0-9]+$/

function lastLineFitsTime(text: string, dir: 0 | 1): { inline: boolean } {
  const last = (text || "").split("\n").pop() || ""
  const cap =
    DIGIT_RE.test(last) ? LAYOUT.perLine.digits :
    UPPER_RE.test(last) ? LAYOUT.perLine.upper :
    LAYOUT.perLine.lower

  const len = last.length % cap || (last.length ? cap : 0)

  // Оценка «места» под время в конце строки:
  // для входящих (без галочек) запас меньше.
  const timeChReserve = dir === 0 ? 4 : 6
  const inline = len <= Math.max(cap - timeChReserve, 0)
  return { inline }
}

export function Message({ dir, theme, ...props }: PropByType[number] & MessageProps): void {
  const reqChildProps = { type: props.type, dir, theme }
  const color = remapTokens({
    surface: { 0: { dark: "#262628", light: "#FFF" }, 1: { dark: "#363638", light: "#E1FEC6" } },
    text: {
      primary0: { dark: "#FFF", light: "#000" },
      primary1: { dark: "#FFF", light: "#000" },
      label0: { dark: "#8D8D8F", light: "#8D8D8F" },
      label1: { dark: "#8D8D8F", light: "#3EAA3C" },
    },
    stroke: {
      bubble: { dark: "#FFFFFF1A", light: "#00000014" },
    },
  })[theme]

  // Переключение цветов/эффектов для IN-матта
  const isIn = dir === 0
  const bubbleFill = isIn ? MATTE_BG : (color.surface as any)[dir]
  const primaryText = isIn ? MATTE_TEXT : (color.text as any)[`primary${dir}`]
  const labelText = isIn ? MATTE_LABEL : (color.text as any)[`label${dir}`]

  const imgSrc = (props as unknown as Message).imgSrc
  const statusWidth = LAYOUT.statusWidthByDir[dir]

  function Container({ children, showBox = true }: Partial<AutoLayoutProps> & { showBox?: boolean }) {
    const basePadH = props.type === 0 ? 8 : 14

    // НЕ прокидываем width/x/y из props, чтобы контейнер не становился fill-parent
    const { width: _w, height: _h, x: _x, y: _y, ...forward } = (props as any) || {}

    return (
      <AutoLayout
        name={`Message${EDITOR_INPUTS.type.map[props.type] + dir}`}
        effect={{ type: "drop-shadow", color: "#00000040", offset: { x: 0, y: 4 }, blur: 22.6, showShadowBehindNode: false }}
        overflow="visible"
        verticalAlignItems="end"
        width="hug-contents"
        {...forward}
      >
        <TailAtom
          {...reqChildProps}
          name="_tail-atom"
          x={{ type: LAYOUT.tailX[dir], offset: -6.077 }}
          y={{ type: "bottom", offset: -1 }}
          positioning="absolute"
        />
        {showBox ? (
          <AutoLayout
            name="text box"
            fill={bubbleFill}
            cornerRadius={LAYOUT.radius[dir]}
            direction="vertical"
            spacing={6}
            padding={{ vertical: 8, horizontal: basePadH }}
            effect={isIn ? { type: "background-blur", blur: 60 } : undefined}
          >
            {children}
          </AutoLayout>
        ) : (
          children
        )}
      </AutoLayout>
    )
  }

  switch (props.type) {
    case 0: {
      const { name, size, extension, isImg } = props
      const previewSrc = isImg ? (imgSrc || PreviewImage64) : ICON_MAP[theme][dir]
      return (
        <Container>
          <AutoLayout name="Conent File" minWidth={100} overflow="visible" verticalAlignItems="center">
            <Image name="Preview" cornerRadius={11} width={74} height={74} src={previewSrc} />
            <AutoLayout name="Stats" overflow="visible" direction="vertical" padding={{ vertical: 0, horizontal: 8 }}>
              <AutoLayout name="Frame 3" overflow="visible" width="fill-parent">
                <Text fill={primaryText} lineHeight={21} letterSpacing={-0.3}>{name}</Text>
                <Text fill={primaryText} lineHeight={21} letterSpacing={-0.3}>{extension}</Text>
              </AutoLayout>
              <AutoLayout name="Frame 2" overflow="visible" width={43}>
                <Text fill={labelText} fontSize={13} letterSpacing={-0.1}>{size}</Text>
                <Text fill={labelText} fontSize={13} letterSpacing={-0.1}>{"  "}MB</Text>
              </AutoLayout>
            </AutoLayout>
          </AutoLayout>
        </Container>
      )
    }

    case 1: {
      const { text } = props
      const { inline } = lastLineFitsTime(text, dir as 0 | 1)

      return (
        <Container>
          {inline ? (
            <AutoLayout
              name="Content Text Inline"
              minWidth={60}
              maxWidth={LAYOUT.textMaxW}
              overflow="visible"
              direction="horizontal"
              verticalAlignItems="end"
              spacing={6}
              width="hug-contents"
            >
              <Text
                fill={primaryText}
                width="fill-parent"
                maxWidth={LAYOUT.textMaxW - statusWidth - 6}
                lineHeight={22}
                fontSize={15}
                letterSpacing={-0.4}
              >
                {text}
              </Text>
              <StatusAtom
                {...reqChildProps}
                color={labelText}
                dir={dir}
                name="_status-atom-inline"
                width={statusWidth}
              />
            </AutoLayout>
          ) : (
            <AutoLayout
              name="Content Text Below"
              minWidth={60}
              maxWidth={LAYOUT.textMaxW}
              overflow="visible"
              direction="vertical"
              spacing={5}
            >
              <Text
                fill={primaryText}
                width="fill-parent"
                lineHeight={22}
                fontSize={15}
                letterSpacing={-0.4}
              >
                {text}
              </Text>
              <AutoLayout width="fill-parent" horizontalAlignItems="end">
                <StatusAtom
                  {...reqChildProps}
                  color={labelText}
                  dir={dir}
                  name="_status-atom-below"
                  width={LAYOUT.statusWidthByDir[dir]}
                />
              </AutoLayout>
            </AutoLayout>
          )}
        </Container>
      )
    }

    case 2: {
      // Image with bubble background + stroke (обводка)
      const { text } = props
      const source = imgSrc || PreviewImage64

      const { w, h } = getImageSize(source)
      const maxW = LAYOUT.maxImageW
      let outW = w ? Math.min(w, maxW) : maxW
      let outH = h ? Math.round(h * (outW / (w || outW))) : Math.round((142 * outW) / 276)
      if (text) {
        outW = Math.max(outW, LAYOUT.minImageW)
        outH = Math.max(outH, LAYOUT.minImageH)
      }

      const { inline } = lastLineFitsTime(text || "", dir as 0 | 1)

      return (
        <Container showBox={false}>
          {/* собственный bubble с фоном и обводкой */}
          <AutoLayout
            name="Bubble"
            fill={bubbleFill}
            stroke={bubbleFill}
            strokeAlign="outside"
            cornerRadius={LAYOUT.radius[dir]}
            overflow="visible"
            direction="vertical"
            spacing={inline ? 0 : 5}
            padding={{ vertical: 0, horizontal: 0 }}
            width="hug-contents"
            height="hug-contents"
            effect={isIn ? { type: "background-blur", blur: 15 } : undefined}
          >
            <Image
              name="Photo"
              cornerRadius={{
                topLeft:  LAYOUT.radius[dir].topLeft - 1,
                topRight: LAYOUT.radius[dir].topRight - 1,
                bottomRight: text ? 0 : LAYOUT.radius[dir].bottomRight - 1,
                bottomLeft:  text ? 0 : LAYOUT.radius[dir].bottomLeft  - 1,
              }}
              width={outW}
              height={outH}
              src={source}
            />

            {text && (
              inline ? (
                <AutoLayout
                  name="Caption Inline"
                  width={outW}
                  padding={{ vertical: 8, horizontal: 14 }}
                  direction="horizontal"
                  verticalAlignItems="end"
                  spacing={6}
                >
                  <Text
                    fill={primaryText}
                    width="fill-parent"
                    maxWidth={outW - 14 - 14 - LAYOUT.statusWidthByDir[dir] - 6}
                    lineHeight={22}
                    fontSize={15}
                    letterSpacing={-0.4}
                  >
                    {text}
                  </Text>
                  <StatusAtom
                    {...reqChildProps}
                    color={labelText}
                    dir={dir}
                    name="_status-atom-inline"
                    width={LAYOUT.statusWidthByDir[dir]}
                  />
                </AutoLayout>
              ) : (
                <AutoLayout
                  name="Caption Below"
                  width={outW}
                  padding={{ vertical: 8, horizontal: 14 }}
                  direction="vertical"
                  spacing={5}
                >
                  <Text
                    fill={primaryText}
                    width="fill-parent"
                    lineHeight={22}
                    fontSize={15}
                    letterSpacing={-0.4}
                  >
                    {text}
                  </Text>
                  <AutoLayout width="fill-parent" horizontalAlignItems="end">
                    <StatusAtom
                      {...reqChildProps}
                      color={labelText}
                      dir={dir}
                      name="_status-atom-below"
                      width={LAYOUT.statusWidthByDir[dir]}
                    />
                  </AutoLayout>
                </AutoLayout>
              )
            )}
          </AutoLayout>
        </Container>
      )
    }
  }
}
