import React, { useEffect, useRef } from "react";
import { Pose, POSE_CONNECTIONS, Results } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

const WebcamFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current!;
    const canvasElement = canvasRef.current!;
    const canvasCtx = canvasElement.getContext("2d")!;

    // Initialize MediaPipe Pose
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results: Results) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }
      canvasCtx.restore();
    });

    poseRef.current = pose;

    // Initialize camera
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    cameraRef.current = camera;

    return () => {
      camera.stop();
      pose.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[640px] h-[480px]">
        <video
          ref={videoRef}
          className="absolute top-0 left-0"
          style={{ transform: "scaleX(-1)" }} // Mirror the webcam feed
          width={840}
          height={480}
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          width={840}
          height={480}
        />
      </div>
      <p className="text-gray-600 mt-2 text-sm">Webcam Feed + Pose Detection</p>
    </div>
  );
};

export default WebcamFeed;
