import React from "react";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";

const StepProgressBar = ({ progress = 0 }: { progress: number }) => {
  return (
    <ProgressBar
      percent={progress * 100}
      filledBackground="linear-gradient(to right,rgb(254, 114, 242),rgb(138, 49, 240))"
    >
      <Step transition="scale">
        {({ accomplished }) => (
          <img
            style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
            width="50"
            src="https://em-content.zobj.net/source/microsoft-teams/337/man-standing_1f9cd-200d-2642-fe0f.png"
            alt="Step 1"
          />
        )}
      </Step>
      <Step transition="scale">
        {({ accomplished }) => (
          <img
            style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
            width="50"
            src="https://em-content.zobj.net/source/microsoft-teams/337/man-lifting-weights_1f3cb-fe0f-200d-2642-fe0f.png"
            alt="Step 2"
          />
        )}
      </Step>
      <Step transition="scale">
        {({ accomplished }) => (
          <img
            style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
            width="50"
            src="https://em-content.zobj.net/source/microsoft-teams/337/flexed-biceps_1f4aa.png"
            alt="Step 3"
          />
        )}
      </Step>
    </ProgressBar>
  );
};

export default StepProgressBar;