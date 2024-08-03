import { Layer, Path, Stage } from "react-konva";

export const Canvas = () => {
  return (
    <Stage width={1200} height={1400}>
      <Layer>
        <Path
          data={"M834.72 329.895v853.07h369.955v-853.07Z"}
          // fill={colors[i % colors.length]}
          // fill={"black"}
          stroke="black"
          strokeWidth={3}
          scaleX={0.7}
          scaleY={0.7}
          opacity={1}
          lineCap="round"
          lineJoin="round"
          // preventDefault={false}
          // visible={false}
          // visible={true}
        />
      </Layer>
    </Stage>
  );
};
