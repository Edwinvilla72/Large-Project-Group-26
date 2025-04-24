import React from "react";

const emojiSteps = [
  {
    src: "https://em-content.zobj.net/source/microsoft-teams/337/man-standing_1f9cd-200d-2642-fe0f.png",
    alt: "Step 1",
  },
  {
    src: "https://em-content.zobj.net/source/microsoft-teams/337/man-lifting-weights_1f3cb-fe0f-200d-2642-fe0f.png",
    alt: "Step 2",
  },
  {
    src: "https://em-content.zobj.net/source/microsoft-teams/337/flexed-biceps_1f4aa.png",
    alt: "Step 3",
  },
];

const StepProgressBar = ({ progress = 0 }: { progress: number }) => {
  const totalSteps = emojiSteps.length;
  const activeStep = Math.floor(progress * totalSteps);

  return (
    <div style={styles.container}>
      <div style={{ ...styles.fill, width: `${progress * 100}%` }} />
      <div style={styles.steps}>
        {emojiSteps.map((step, i) => (
          <img
            key={i}
            src={step.src}
            alt={step.alt}
            width={34}
            height={34}
            style={{
              filter: `grayscale(${i <= activeStep ? 0 : 80}%)`,
              zIndex: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "relative",
    height: "42px", 
    background: "rgba(255, 255, 255, 0.12)",
    borderRadius: "21px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    padding: "0 22px",
  },
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    background: "linear-gradient(to right, #FF85D8, #9D5EF0)",
    transition: "width 0.3s ease-in-out",
    zIndex: 1,
  },
  steps: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

export default StepProgressBar;
