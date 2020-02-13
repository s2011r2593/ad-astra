import React, { Component } from 'react';
import styled, { keyframes } from 'styled-components';
import * as THREE from 'three';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      w: window.innerWidth,
      h: window.innerHeight,
      playing: true,
      showing: true,
      tStep: 0,
      doFade: true,
      center: 0,
      timeDistortion: 1 / 1000000,
    }

    this.handleResize = this.handleResize.bind(this);
    this.handleKey = this.handleKey.bind(this);

    this.planets = [];
    this.G = 6.67e-11 / Math.pow(60 * this.state.timeDistortion, 2);

    this.planets.push([0, 0, 40 * 723187500, 1.989e30, 0, 0, 0xffffb8]); // x, z, r, m , vx, vz, color
    this.planets.push([-46034000000,  0, 3 * 723187500, 3.285e23, 0, Math.pow(this.G * this.planets[0][3] / 46034000000, 0.5), 0xe8e8e8]);
    this.planets.push([-107920000000, 0, 5.5 * 723187500, 4.867e24, 0, Math.pow(this.G * this.planets[0][3] / 107920000000, 0.5), 0xffc859]);
    this.planets.push([-147680000000, 0, 10 * 723187500, 5.972e24, 0, Math.pow(this.G * this.planets[0][3] / 147680000000, 0.5), 0x3679e3]);
    this.planets.push([-231420000000, 0, 8 * 723187500, 6.39e23, 0, Math.pow(this.G * this.planets[0][3] / 231420000000, 0.5), 0xa83225]);

    var frustumSize = 350000000000;
    var aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera( frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -880796875000, 723187500000 );
    this.camera.position.set( 0, 2, -5 );
    this.camera.lookAt(0, 0, 0);

    this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x220436 );

    //var axesHelper = new THREE.AxesHelper( 5 );
    //scene.add( axesHelper );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.light = new THREE.PointLight( 0xffffb8, 0.7, Infinity );
    this.light.position.set( 0, 0, 0 );

    var amb = new THREE.AmbientLight( 0xf9faed, 0.6 ); // soft white light
    this.scene.add( amb );

    this.scene.add( this.light );

    this.geos = [];
    var mats = [];
    var meshes = [];
    this.geos.push(new THREE.SphereGeometry( this.planets[0][2], 30, 30 ));
    mats.push(new THREE.MeshBasicMaterial({ color: this.planets[0][6] }));
    meshes.push(new THREE.Mesh( this.geos[0], mats[0] ));
    this.scene.add( meshes[0] )
    for (var i = 1; i < this.planets.length; i++) {
      this.geos.push(new THREE.SphereGeometry( this.planets[i][2], 30, 30 ));
      this.geos[i].translate( this.planets[i][0], 0, this.planets[i][1] );
      mats.push(new THREE.MeshLambertMaterial({ color: this.planets[i][6], shading: THREE.FlatShading }));
      meshes.push(new THREE.Mesh( this.geos[i], mats[i] ));
      meshes[i].castShadow = true;
      this.scene.add( meshes[i] )
    }
  }

  componentDidMount() {
    this.mount.appendChild( this.renderer.domElement );
    this.animate();

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKey, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKey, false);
  }

  handleResize = () => {
    this.setState({ w: window.innerWidth });
    this.setState({ h: window.innerHeight });

    var frustumSize = 1000000000000;
    var aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera( frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -880796875000, 723187500000 );
    this.camera.position.set( 0, 2.1, 5 );
    this.camera.lookAt(0, 0, 0);


    this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  handleKey = (e) => {
    if (e.keyCode === 32) {
      this.pause();
    } else if (e.keyCode === 72) {
      this.hide();
    } else if (e.keyCode === 48) {
      this.setState({ center: 0 });
    } else if (e.keyCode === 49) {
      this.setState({ center: 1 });
    } else if (e.keyCode === 50) {
      this.setState({ center: 2 });
    } else if (e.keyCode === 51) {
      this.setState({ center: 3 });
    } else if (e.keyCode === 52) {
      this.setState({ center: 4 });
    }
  }

  pause = () => {
    this.setState({ playing: !this.state.playing });
    requestAnimationFrame( this.animate );
  }

  hide = () => {
    this.setState({ showing: !this.state.showing });
    this.setState({ doFade: false });
  }

  animate = () => {
    if (this.state.playing) {
      for (var i = 0; i < this.planets.length; i++) {
        for (var j = i + 1; j < this.planets.length; j++) {
          this.upV(i, j);
        }
        this.geos[i].translate( this.planets[i][4], 0, this.planets[i][5] );
        this.planets[i][0] += this.planets[i][4];
        this.planets[i][1] += this.planets[i][5];
      }

      //camera.translateZ(this.planets[0][5]);
      this.camera.position.set( this.planets[this.state.center][0], 130, this.planets[this.state.center][1] + 300);
      this.light.position.set( this.planets[0][0], 0, this.planets[0][1] );

      requestAnimationFrame( this.animate );
      this.renderer.render( this.scene, this.camera );
      this.setState({ tStep: this.state.tStep + 1 });
    }
  }

  upV = (p1Index, p2Index) => {
    var p1 = this.planets[p1Index];
    var p2 = this.planets[p2Index];
    var dv1x = this.G * (p2[3] / (Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))) * Math.cos(Math.atan2(p2[1] - p1[1], p2[0] - p1[0]));
    var dv1z = this.G * (p2[3] / (Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))) * Math.sin(Math.atan2(p2[1] - p1[1], p2[0] - p1[0]));
    var dv2x = this.G * (p1[3] / (Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))) * Math.cos(Math.atan2(p1[1] - p2[1], p1[0] - p2[0]));
    var dv2z = this.G * (p1[3] / (Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))) * Math.sin(Math.atan2(p1[1] - p2[1], p1[0] - p2[0]));

    this.planets[p1Index][4] += dv1x;
    this.planets[p1Index][5] += dv1z;
    this.planets[p2Index][4] += dv2x;
    this.planets[p2Index][5] += dv2z;
  }

  render() {
    return (
      <div>
        <div ref={ref => (this.mount = ref)} />
        <Title>
          <TitleText>
            The Planetarium
          </TitleText>
        </Title>
        {this.state.showing &&
          <Variables>
              <Counter f={this.state.doFade}>
                Variables:
              </Counter>
              <Counter f={this.state.doFade}>
                t = {Math.round((this.state.tStep / (60 * this.state.timeDistortion))/1000)*1000} s
              </Counter>
              <Counter f={this.state.doFade}>
                x<sub>sun</sub> = {Math.round(this.planets[0][0] - this.planets[this.state.center][0])} m
              </Counter>
              <Counter f={this.state.doFade}>
                z<sub>sun</sub> = {Math.round(this.planets[0][1] - this.planets[this.state.center][1])} m
              </Counter>
              <Counter f={this.state.doFade}>
                x<sub>mercury</sub> = {Math.round(this.planets[1][0] - this.planets[this.state.center][0])} m
              </Counter>
              <Counter f={this.state.doFade}>
                z<sub>mercury</sub> = {Math.round(this.planets[1][1] - this.planets[this.state.center][1])} m
              </Counter>
              <Counter f={this.state.doFade}>
                x<sub>venus</sub> = {Math.round(this.planets[2][0] - this.planets[this.state.center][0])} m
              </Counter>
              <Counter f={this.state.doFade}>
                z<sub>venus</sub> = {Math.round(this.planets[2][1] - this.planets[this.state.center][1])} m
              </Counter>
              <Counter f={this.state.doFade}>
                x<sub>earth</sub> = {Math.round(this.planets[3][0] - this.planets[this.state.center][0])} m
              </Counter>
              <Counter f={this.state.doFade}>
                z<sub>earth</sub> = {Math.round(this.planets[3][1] - this.planets[this.state.center][1])} m
              </Counter>
              <Counter f={this.state.doFade}>
                x<sub>mars</sub> = {Math.round(this.planets[4][0] - this.planets[this.state.center][0])} m
              </Counter>
              <Counter f={this.state.doFade}>
                z<sub>mars</sub> = {Math.round(this.planets[4][1] - this.planets[this.state.center][1])} m
              </Counter>
            <Tips f={this.state.doFade}>
              <br/>Press SPACE to pause<br/>Press 0~4 to change the center of the solar system<br/>Press h to hide clutter
            </Tips>
          </Variables>
        }
      </div>
    )
  }
}

export default App;

const Fade = keyframes`
  0% { color: #ebebeb00; }
  40% { color: #ebebeb00; }
  100% { color: #ebebebbb; }
`;

const Title = styled.div`
  position: absolute;
  top: 20px;
  width: 100%;
  text-align: center;
  z-index: 100;
  display: block;
  font-weight: 300;
`;

const TitleText = styled.h1`
  color: #ebebeb;
  font-style: italic;
  font-size: 36px;
  font-family: 'Sulphur Point', sans-serif;
  font-weight: 300;
  animation: ${Fade} 2s linear 1;
`;

const Variables = styled.div`
  position: absolute;
  bottom: 14px;
  left: 35px;
  z-index: 100;
  display: block;
  font-weight: 300;
`;

const Counter = styled.h2`
  color: #ebebebbb;
  font-style: italic;
  font-size: 16px;
  font-family: 'Sulphur Point', sans-serif;
  font-weight: 300;
  animation: ${Fade} 2s linear ${props => (props.f === false) ? 0 : 1};
  line-height: 16px;
`;

const Tips = styled.p`
  color: #ebebebbb;
  font-style: italic;
  font-size: 10px;
  font-family: 'Sulphur Point', sans-serif;
  margin-top: -10px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 400;
  animation: ${Fade} 2s linear ${props => (props.f === false) ? 0 : 1};
`;
