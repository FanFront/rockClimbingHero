import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import Svg, { Rect, Path, G } from "react-native-svg";
export type CampDirection = "dusk" | "morning" | "night";
export function CampScene({
  direction = "dusk",
  reduced = false,
  marked = false,
  panorama = false,
}: {
  direction?: CampDirection;
  reduced?: boolean;
  marked?: boolean;
  panorama?: boolean;
}) {
  const glow = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    if (reduced) {
      glow.setValue(0.85);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.7,
          duration: 2100,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, glow]);
  const sky =
    direction === "morning"
      ? "#9ebdc0"
      : direction === "night"
        ? "#111f38"
        : "#51485b";
  return (
    <View
      style={[
        styles.scene,
        panorama && { aspectRatio: 180 / 140, borderRadius: 18 },
      ]}
      accessibilityLabel="Mountain camp, explorer and lantern"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={panorama ? "0 40 180 140" : "0 0 180 190"}
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect width="180" height="190" fill={sky} />
        <Rect
          y="55"
          width="180"
          height="38"
          fill={direction === "morning" ? "#d7c9a2" : "#a47671"}
        />
        <Rect x="132" y="22" width="15" height="15" fill="#f5d598" />
        <Path
          d="M0 91V73H12V61H22V49H33V36H43V49H53V62H65V74H78V83H91V58H102V43H112V30H122V48H132V62H145V76H160V65H170V81H180V125H0Z"
          fill="#536475"
        />
        <Path
          d="M22 49H33V36H43V49H49V55H38V49H32V55H22ZM102 43H112V30H122V48H115V42H110V49H102Z"
          fill="#d3d9cf"
        />
        <Path
          d="M0 109H22V98H43V103H62V95H82V108H110V93H140V101H162V94H180V190H0Z"
          fill="#294d4d"
        />
        <Path d="M180 91H160V101H146V116H137V145H180Z" fill="#7c7d73" />
        <Path d="M170 103H159V119H150V138H180V128H167Z" fill="#999786" />
        {[8, 22, 38, 139, 155, 174].map((x, i) => (
          <G key={x} x={x} y={72 + (i % 3) * 8}>
            <Rect x="-1" y="18" width="3" height="46" fill="#695c48" />
            <Path
              d="M0 0H3V7H7V13H11V20H15V26H-12V20H-8V13H-4V7H0Z"
              fill={i % 2 ? "#183c3e" : "#214647"}
            />
          </G>
        ))}
        <Path
          d="M0 146H30V139H65V145H106V137H140V144H180V190H0Z"
          fill="#3e5547"
        />
        <Path
          d="M78 190V180H90V169H104V160H111V151H124V159H119V170H110V182H102V190Z"
          fill="#8b8062"
        />
        <Path
          d="M17 147V139H22V131H27V123H32V115H37V107H42V115H47V123H52V131H57V139H62V147Z"
          fill="#ce9a61"
        />
        <Path
          d="M37 107H42V115H47V123H52V131H57V139H62V147H37Z"
          fill="#956b49"
        />
        <Path d="M30 147V136H33V128H37V147Z" fill="#283537" />
        <Rect x="123" y="137" width="3" height="20" fill="#af9364" />
        <Rect x="120" y="133" width="9" height="10" fill="#f9d68b" />
        <Rect x="122" y="135" width="5" height="6" fill="#fff0ba" />
        <Rect x="72" y="154" width="17" height="3" fill="#9b7753" />
        <Rect x="75" y="158" width="15" height="3" fill="#67503e" />
        <G x="100" y="119">
          <Rect x="-2" y="27" width="19" height="3" fill="#243b37" />
          <Rect x="3" y="3" width="9" height="8" fill="#dcb58a" />
          <Path d="M1 4V1H4V-1H11V1H14V4Z" fill="#bca475" />
          <Rect x="10" y="6" width="2" height="2" fill="#25363c" />
          <Rect x="2" y="12" width="11" height="10" fill="#7babb0" />
          <Rect x="-1" y="12" width="4" height="10" fill="#c19461" />
          <Rect x="3" y="22" width="4" height="6" fill="#243846" />
          <Rect x="10" y="22" width="4" height="6" fill="#243846" />
        </G>
        <Rect x="145" y="160" width="18" height="12" fill="#a58a61" />
        <Rect x="147" y="162" width="14" height="8" fill="#dfc99c" />
        {marked && (
          <Path d="M150 164H153V166H157V164H160V168H150Z" fill="#7f6350" />
        )}
        {Array.from({ length: 18 }, (_, i) => (
          <Rect
            key={i}
            x={(i * 29 + 3) % 180}
            y={151 + ((i * 13) % 38)}
            width="3"
            height="2"
            fill={i % 3 ? "#627354" : "#a39265"}
          />
        ))}
      </Svg>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fire,
          panorama && { top: "65%", height: "17%" },
          { opacity: glow },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 20 24">
          <Path d="M2 23V14H6V9H9V1H12V9H15V14H18V23Z" fill="#dc854d" />
          <Path d="M6 23V16H9V12H12V18H15V23Z" fill="#ffe3a0" />
        </Svg>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  scene: {
    width: "100%",
    aspectRatio: 180 / 190,
    overflow: "hidden",
    backgroundColor: "#294d4d",
  },
  fire: {
    position: "absolute",
    left: "40%",
    top: "69%",
    width: "11%",
    height: "12%",
  },
});
