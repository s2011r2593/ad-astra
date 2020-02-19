import React, { Component } from 'react';
import styled, { keyframes } from 'styled-components';
import * as THREE from 'three';

import Solar from './components/solar';
import Sand from './components/sandbox';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      screen: 0,
      df: true,
    }


    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x220436 );
  }

  toggleScreen = () => {
    while(this.scene.children.length > 0){
      this.scene.remove(this.scene.children[0]);
    }
    this.scene.traverse(object => {
      if (!object.isMesh) return
      object.geometry.dispose();
      if (object.material.isMaterial) {
        this.cleanMaterial(object.material);
      } else {
        for (const material of object.material) this.cleanMaterial(material);
      }
    });
    this.setState({ screen: 1 - this.state.screen });
    this.setState({ df: false });
  }

  cleanMaterial = (material) => {
    material.dispose();
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose();
      }
    }
  }

  render() {
    var s;
    if (this.state.screen === 0) {
      s = <Solar scene={this.scene} handler={this.toggleScreen} doFade={this.state.df}/>
    } else {
      s = <Sand scene={this.scene} handler={this.toggleScreen}/>
    }
    return (
      <div>
        {s}
      </div>
    )
  }
}

export default App;
