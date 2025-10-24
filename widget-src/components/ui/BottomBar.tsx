// widget-src/components/ui/BottomBar.tsx

// Dependencies
const { Frame, Text, Rectangle, SVG } = figma.widget
import { remapTokens } from "@/utils"
import { IosBottomBar } from "@/components/ui/atoms"

interface BottomBarProps extends ReqCompProps, Partial<FrameProps> {}

export function BottomBar({ theme, ...props }: BottomBarProps) {
  const color = remapTokens({
    text: { input: { dark: "#FFFFFF66", light: "#00000066" } },
  })[theme]

  // Геометрия
  const WIDTH = 375
  const HEIGHT = 80
  const TOP_Y = 8

  const SIDE_BTN = 36
  const SIDE_R = 18
  const SIDE_GAP = 8

  const CAPS_INNER_PAD = 12         // расстояние от круглых кнопок до капсулы
  const CAPS_LEFT = SIDE_GAP + SIDE_BTN + CAPS_INNER_PAD // 8 + 36 + 12 = 56
  const CAPS_RIGHT = CAPS_LEFT
  const CAPS_W = WIDTH - CAPS_LEFT - CAPS_RIGHT          // 263
  const CAPS_H = 40
  const CAPS_R = 20
  const CAPS_Y = TOP_Y

  // Иконки
  const svg = {
    attach: `<svg width='22' height='22' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <path d='M20.2 11.3L13.1 18.4C10.9 20.6 7.4 20.6 5.2 18.4C3 16.2 3 12.7 5.2 10.5L12 3.7C13.5 2.2 15.9 2.2 17.4 3.7C18.9 5.2 18.9 7.6 17.4 9.1L10.9 15.6C10.1 16.4 8.9 16.4 8.2 15.6C7.5 14.9 7.5 13.7 8.2 13L13.4 7.8' stroke='#FFFFFF' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/>
</svg>`,
    sticker: `<svg width='18' height='18' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <path d='M10 1.5C5.3 1.5 1.5 5.3 1.5 10C1.5 14.7 5.3 18.5 10 18.5C14.7 18.5 18.5 14.2 18.5 10.5C17.9 10.8 16.9 11 15.9 11C12.5 11 9.5 8 9.5 4.6C9.5 3.7 9.7 2.8 10.1 2.1C11.9 3.2 16.7 8.1 17.8 9.9'
        stroke='#8D8D8F' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/>
</svg>`,
    mic: `<svg width='18' height='18' viewBox='0 0 20 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <path d='M10 1.5C12.1 1.5 13.8 3.2 13.8 5.3V12C13.8 14.1 12.1 15.8 10 15.8C7.9 15.8 6.2 14.1 6.2 12V5.3C6.2 3.2 7.9 1.5 10 1.5Z' stroke='#FFFFFF' stroke-width='1.8' stroke-linecap='round'/>
  <path d='M18.2 12C18.2 16.2 14.8 19.6 10.6 19.8V22.5' stroke='#FFFFFF' stroke-width='1.8' stroke-linecap='round'/>
  <path d='M1.8 12C1.8 16.2 5.2 19.6 9.4 19.8' stroke='#FFFFFF' stroke-width='1.8' stroke-linecap='round'/>
</svg>`,
  }

  // Стеклянные стили
  const GLASS_FILL = { r: 1, g: 1, b: 1, a: 0.08 }
  const GLASS_STROKE = { r: 1, g: 1, b: 1, a: 0.16 }
  const BLUR_EFFECT: Effect = { type: "background-blur", blur: 22 }

  return (
    <Frame name="ChatInput" width={375} height={80} {...props}>
      {/* ЛЕВАЯ КНОПКА */}
      <Frame name="Btn/Attach" x={SIDE_GAP} y={CAPS_Y + (CAPS_H - SIDE_BTN) / 2} width={SIDE_BTN} height={SIDE_BTN}>
        <Rectangle
          name="bg"
          width={SIDE_BTN}
          height={SIDE_BTN}
          cornerRadius={SIDE_R}
          fill={GLASS_FILL}
          stroke={GLASS_STROKE}
          strokeWidth={1}
          effect={BLUR_EFFECT}
        />
        <SVG
          name="Icon/Attach"
          x={(SIDE_BTN - 22) / 2}
          y={(SIDE_BTN - 22) / 2}
          width={22}
          height={22}
          src={svg.attach}
        />
      </Frame>

      {/* КАПСУЛА (Rectangle, НЕ Frame) */}
      <Rectangle
        name="InputCapsule/bg"
        x={{ type: "left-right", leftOffset: CAPS_LEFT, rightOffset: CAPS_RIGHT }}
        y={CAPS_Y}
        width={CAPS_W}
        height={CAPS_H}
        cornerRadius={CAPS_R}
        fill={GLASS_FILL}
        stroke={GLASS_STROKE}
        strokeWidth={1}
        effect={BLUR_EFFECT}
      />

      {/* Placeholder внутри капсулы */}
      <Text
        name="Message"
        x={{ type: "left", offset: CAPS_LEFT + 14 }}
        y={{ type: "top", offset: CAPS_Y + (CAPS_H - 22) / 2 - 0.5 }}
        fill={color.text.input}
        lineHeight={22}
        fontSize={14}
        letterSpacing={-0.4}
      >
        Message
      </Text>

      {/* Стикер справа внутри капсулы */}
      <Frame
        name="Icon/Stickers"
        x={{ type: "right", offset: CAPS_RIGHT + 10 }}
        y={{ type: "top", offset: CAPS_Y + (CAPS_H - 18) / 2 }}
        width={18}
        height={18}
      >
        <SVG name="Sticker" width={18} height={18} src={svg.sticker} />
      </Frame>

      {/* ПРАВАЯ КНОПКА */}
      <Frame name="Btn/Mic" x={{ type: "right", offset: SIDE_GAP }} y={CAPS_Y + (CAPS_H - SIDE_BTN) / 2} width={SIDE_BTN} height={SIDE_BTN}>
        <Rectangle
          name="bg"
          width={SIDE_BTN}
          height={SIDE_BTN}
          cornerRadius={SIDE_R}
          fill={GLASS_FILL}
          stroke={GLASS_STROKE}
          strokeWidth={1}
          effect={BLUR_EFFECT}
        />
        <SVG
          name="Icon/Mic"
          x={(SIDE_BTN - 18) / 2}
          y={(SIDE_BTN - 18) / 2}
          width={18}
          height={18}
          src={svg.mic}
        />
      </Frame>

      {/* iOS home indicator */}
      <IosBottomBar
        theme={theme}
        name="_ios/BottomBar"
        x={{ type: "center", offset: 0 }}
        y={{ type: "bottom", offset: 0 }}
      />
    </Frame>
  )
}
