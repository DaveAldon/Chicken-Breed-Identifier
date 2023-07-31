import React, { useRef } from 'react';
import { View, Text, Image, Button } from 'react-native';
import { useTensor } from './hooks/useTensor';
import Canvas from 'react-native-canvas';

const App = () => {
  const image = require('./chicken.jpg');
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const { isTfReady, result, load, isLoadingResult } = useTensor(canvasRef);


  return (
    <View
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        ref={imageRef}
        source={require('./chicken.jpg')}
        style={{ width: 200, height: 200 }}
      />
      {!isTfReady && <Text>Loading TFJS model...</Text>}
      {isTfReady && result === '' && <Text>Model Ready</Text>}
      {result !== '' && <Text>{result}</Text>}
      {isLoadingResult ? <Text>Loading result...</Text> : <Button
        title="Classify"
        onPress={async () => {
          await load(image);
        }}
      />}
      <Canvas
        ref={imageRef} />
    </View>
  );
};

export default App;
