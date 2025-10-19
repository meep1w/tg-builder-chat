// Dependencies
const { Frame, Image, AutoLayout } = figma.widget
// Components
import { FrameBezel64, DynamicIsland64 } from "@/assets/base64"

interface PhoneFrameProps extends Partial<AutoLayoutProps>, ReqCompProps, OptionalRender {}

/** iPhone Frame with Bezel + Dynamic Isalnd */
export function PhoneFrame({ renderElements, children }: PhoneFrameProps) {
   return !renderElements ? (
      children
   ) : (
      <AutoLayout
         name="Phone" // Container (shadow & fixed ratio)
         effect={[
            {
               type: "drop-shadow",
               color: "#0000001A",
               offset: {
                  x: 0,
                  y: 17,
               },
               blur: 38,
            },
            {
               type: "drop-shadow",
               color: "#00000017",
               offset: {
                  x: 0,
                  y: 69,
               },
               blur: 69,
            },
            {
               type: "drop-shadow",
               color: "#0000000D",
               offset: {
                  x: 0,
                  y: 155,
               },
               blur: 93,
            },
            {
               type: "drop-shadow",
               color: "#00000003",
               offset: {
                  x: 0,
                  y: 275,
               },
               blur: 110,
            },
            {
               type: "drop-shadow",
               color: "#0000",
               offset: {
                  x: 0,
                  y: 430,
               },
               blur: 120,
            },
         ]}
         padding={{
            vertical: 16,
            horizontal: 19,
         }}
         overflow="visible"
         verticalAlignItems="center"
      >
         <Image
            name="Frame + Bezel"
            x={{
               type: "left-right",
               leftOffset: 0,
               rightOffset: 0,
            }}
            y={{
               type: "top-bottom",
               topOffset: 0,
               bottomOffset: 0,
            }}
            positioning="absolute"
            strokeWidth={1}
            width={428}
            height={876}
            src={FrameBezel64}
         />
         <Frame
            // Rounded screen corners
            name="hideCornersOnPhoneDisplay"
            overflow={"hidden"}
            cornerRadius={52}
            // Phone Aspect Ratio
            width={390}
            height={844}
         >
            {/* Viewport */}
            {children}
         </Frame>
         <Image
            name="Dynamic Island"
            x={{
               type: "center",
               offset: 3,
            }}
            positioning="absolute"
            y={16 - 4}
            width={390}
            height={60}
            src={DynamicIsland64}
         />
      </AutoLayout>
   )
}
