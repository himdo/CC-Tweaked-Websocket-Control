import React from 'react'
import ThreeComponent from './ReactThreeCanvas';

const Home=(props) => {
  let world = props['world']
  return (
    <ThreeComponent world={world}/>
  );
}
  
export default Home;