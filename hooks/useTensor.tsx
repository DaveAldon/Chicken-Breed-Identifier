import { useEffect, useRef, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { fetch, decodeJpeg } from '@tensorflow/tfjs-react-native';
import { Image, ImageSourcePropType } from 'react-native';


export const useTensor = () => {
  const [isTfReady, setIsTfReady] = useState(false);
  const [result, setResult] = useState('');

  const startTFJSModel = async () => {
    try {
      if (isTfReady) return;
      console.log('startTFJSModel...');
      await tf.ready();
      setIsTfReady(true);
    } catch (err) {
      console.log(err);
    }
  }

  const load = async (image: ImageSourcePropType) => {
    try {
      // Load mobilenet.
      //await tf.ready();
      const model = await mobilenet.load();
      //setIsTfReady(true);

      // Start inference and show result.
      const imageAssetPath = Image.resolveAssetSource(image);
      const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
      const imageDataArrayBuffer = await response.arrayBuffer();
      const imageData = new Uint8Array(imageDataArrayBuffer);
      const imageTensor = decodeJpeg(imageData);
      const prediction = await model.classify(imageTensor);
      if (prediction && prediction.length > 0) {
        setResult(
          `${prediction[0].className} (${prediction[0].probability.toFixed(3)})`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  return {
    isTfReady,
    result,
    load,
    startTFJSModel
  }
}