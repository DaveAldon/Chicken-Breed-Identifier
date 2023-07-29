import React, { useRef } from 'react';
import { View, Text, Image } from 'react-native';
import { useTensor } from './hooks/useTensor';

const App = () => {
  //const image = require('./basketball.jpg');
  const { isTfReady, result, startTFJSModel } = useTensor();
  const image = useRef(null);

  React.useEffect(() => {
    (async () => {
      await startTFJSModel();
    })();
  }, []);

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
        ref={image}
        source={require('./basketball.jpg')}
        style={{ width: 200, height: 200 }}
      />
      {!isTfReady && <Text>Loading TFJS model...</Text>}
      {isTfReady && result === '' && <Text>Classifying...</Text>}
      {result !== '' && <Text>{result}</Text>}
    </View>
  );
};

export default App;
