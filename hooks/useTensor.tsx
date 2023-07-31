import { useEffect, useRef, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import * as tfModel from '@tensorflow-models/coco-ssd';
import { fetch, decodeJpeg } from '@tensorflow/tfjs-react-native';
import { Image, ImageSourcePropType } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import Canvas, { Image as CanvasImage } from "react-native-canvas";
import * as FileSystem from 'expo-file-system';
import useImageColor from 'use-image-color'

export const useTensor = (canvasRef: React.RefObject<Canvas>) => {
  const [isTfReady, setIsTfReady] = useState(false);
  const [result, setResult] = useState('');
  const [model, setModel] = useState<tfModel.ObjectDetection>();
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [uri, setUri] = useState<string>('');
  const { colors } = useImageColor(uri, { cors: true, colors: 5 })

  useEffect(() => {
    (async () => {
      if (isTfReady) return
      await startTFJSModel();
    })();
  }, []);

  const startTFJSModel = async () => {
    try {
      if (isTfReady) return;
      await tf.ready();
      const tmpModel = await tfModel.load()
      setModel(tmpModel);
      setIsTfReady(true);
    } catch (err) {
      console.log(err);
    }
  }

  const cropFrame = async (uri: string, predictedImage: [number, number, number, number]) => {
    const [x, y, width, height] = predictedImage;
    const croppedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: { originX: x, originY: y, width, height } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    return croppedImage
  }

  const readImage = async (imageUri: string, width: number, height: number) => {
    const canvas = canvasRef.current as Canvas;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    const image = new CanvasImage(canvas);

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const src = "data:image/jpeg;base64," + base64;
    image.src = src;
    image.addEventListener("load", () => {
      context.drawImage(image, 0, 0);
      context
        .getImageData(0, 0, canvas.width, canvas.height)
        .then((imageData) => {
          console.log(
            "Image data:",
            imageData,
            Object.values(imageData.data).length
          );
        })
        .catch((e: Error) => {
          console.error("Error with fetching image data:", e);
        });
    });
  };

  const load = async (image: ImageSourcePropType) => {
    try {
      // Start inference and show result.
      if (isTfReady && model !== undefined && isLoadingResult === false) {
        setIsLoadingResult(true);
        const imageAssetPath = Image.resolveAssetSource(image);
        const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
        const imageDataArrayBuffer = await response.arrayBuffer();
        const imageData = new Uint8Array(imageDataArrayBuffer);
        const imageTensor = decodeJpeg(imageData);
        const predictions = await model.detect(imageTensor);
        if (predictions && predictions.length > 0) {
          setResult(
            `${predictions[0].class} (${predictions[0].score.toFixed(3)})`
          );
          const croppedImage = await cropFrame(imageAssetPath.uri, predictions[0].bbox);
          console.log("croppedImage", croppedImage.uri);
          await readImage(croppedImage.uri, croppedImage.width, croppedImage.height);

        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoadingResult(false);
    }
  };

  return {
    isTfReady,
    result,
    load,
    startTFJSModel,
    isLoadingResult
  }
}