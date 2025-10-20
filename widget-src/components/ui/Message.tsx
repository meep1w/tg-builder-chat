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
    // мягкая обводка пузыря
    stroke: {
      bubble: { dark: "#FFFFFF1A", light: "#00000014" },
    },
  })[theme]

  const layout = {
    tailX: ["left", "right"] as const,
    radius: [
      { topLeft: 16, topRight: 18, bottomRight: 18, bottomLeft: 18 },
      { topLeft: 18, topRight: 16, bottomRight: 18, bottomLeft: 18 },
    ] as const,
    maxImageW: 276,
    minImageW: 118,
    minImageH: 118,
  }

  const imgSrc = (props as unknown as Message).imgSrc

  function Container({ children, showBox = true }: Partial<AutoLayoutProps> & { showBox?: boolean }) {
    return (
      <AutoLayout
        name={`Message${EDITOR_INPUTS.type.map[props.type] + dir}`}
        effect={{ type: "drop-shadow", color: "#00000040", offset: { x: 0, y: 4 }, blur: 22.6, showShadowBehindNode: false }}
        overflow="visible"
        verticalAlignItems="end"
        {...props}
      >
        <TailAtom {...reqChildProps} name="_tail-atom" x={{ type: layout.tailX[dir], offset: -6.077 }} y={{ type: "bottom", offset: -1 }} positioning="absolute" />
        {showBox ? (
          <AutoLayout
            name="text box"
            fill={color.surface[dir]}
            cornerRadius={layout.radius[dir]}
            direction="vertical"
            spacing={6}
            padding={{ vertical: 8, horizontal: props.type === 0 ? 8 : 14 }}
          >
            {children}
          </AutoLayout>
        ) : (
          children
        )}
        <StatusAtom
          {...reqChildProps}
          color={color.text[`label${props.type === 2 ? 0 : dir}`]}
          dir={dir}
          name="_status-atom"
          x={{ type: "right", offset: 12 }}
          y={{ type: "bottom", offset: 4 }}
          positioning="absolute"
          width={43}
        />
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
                <Text fill={color.text[`primary${dir}`]} lineHeight={21} letterSpacing={-0.3}>{name}</Text>
                <Text fill={color.text[`primary${dir}`]} lineHeight={21} letterSpacing={-0.3}>{extension}</Text>
              </AutoLayout>
              <AutoLayout name="Frame 2" overflow="visible" width={43}>
                <Text fill={color.text[`label${dir}`]} fontSize={13} letterSpacing={-0.1}>{size}</Text>
                <Text fill={color.text[`label${dir}`]} fontSize={13} letterSpacing={-0.1}>{"  "}MB</Text>
              </AutoLayout>
            </AutoLayout>
          </AutoLayout>
        </Container>
      )
    }

    case 1: {
      const { text } = props
      return (
        <Container>
          <AutoLayout name="Content Text" minWidth={60} maxWidth={250} overflow="visible" spacing={8}>
            <Text fill={color.text[`primary${dir}`]} width="fill-parent" lineHeight={22} fontSize={15} letterSpacing={-0.4}>
              {text + "                "}
            </Text>
          </AutoLayout>
        </Container>
      )
    }

    case 2: {
      // Image with bubble background + stroke (обводка)
      const { text } = props
      const source = imgSrc || PreviewImage64

      const { w, h } = getImageSize(source)
      const maxW = layout.maxImageW
      let outW = w ? Math.min(w, maxW) : maxW
      let outH = h ? Math.round(h * (outW / (w || outW))) : Math.round((142 * outW) / 276)
      if (text) {
        outW = Math.max(outW, layout.minImageW)
        outH = Math.max(outH, layout.minImageH)
      }

      return (
        <Container showBox={false}>
          {/* собственный bubble с фоном и обводкой */}
          <AutoLayout
            name="Bubble"
            fill={color.surface[dir]}
            stroke={color.surface[dir]}
            strokeAlign="outside"
            cornerRadius={layout.radius[dir]}
            overflow="visible"
            direction="vertical"
            spacing={0}
            padding={{ vertical: 0, horizontal: 0 }}
            width="hug-contents"
            height="hug-contents"
          >
            <Image
              name="Photo"
              cornerRadius={{
                topLeft:  layout.radius[dir].topLeft - 1,
                topRight: layout.radius[dir].topRight - 1,
                bottomRight: text ? 0 : layout.radius[dir].bottomRight - 1,
                bottomLeft:  text ? 0 : layout.radius[dir].bottomLeft  - 1,
              }}
              width={outW}
              height={outH}
              src={source}
            />
            {/* подпись по ширине фото, с отступами — чтобы фон был виден */}
            <AutoLayout name="Caption" hidden={!text} width={outW} padding={{ vertical: 8, horizontal: 14 }}>
              <Text fill={color.text[`primary${dir}`]} width="fill-parent" lineHeight={22} fontSize={15} letterSpacing={-0.4}>
                {text + "                "}
              </Text>
            </AutoLayout>
          </AutoLayout>
        </Container>
      )
    }
  }
}
